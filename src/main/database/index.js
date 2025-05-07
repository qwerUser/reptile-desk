const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { DATABASE_PATH } = require('../path');

const tables = [
  {
    name: 'taskList',
    columns: [
      'id INTEGER PRIMARY KEY AUTOINCREMENT',
      'name TEXT', // 名称
      'code TEXT', // 任务code
      'taskJson TEXT', // 任务json
      'createTime INTEGER',
      'updateTime INTEGER',
    ],
  },
  {
    name: 'reptileData', // 拦截接口返回的数据
    columns: [
      'id INTEGER PRIMARY KEY AUTOINCREMENT',
      'taskCode TEXT UNIQUE', // 任务code
      'json TEXT', // 包含每一步存储的所有数据
      'createTime INTEGER',
      'updateTime INTEGER',
    ],
  },
];

// Check if we're in an ASAR package
let databasePath = DATABASE_PATH;
// Check if the parent directory exists
const parentDir = path.dirname(databasePath);
if (!fs.existsSync(parentDir)) {
  // If the directory does not exist, create it
  fs.mkdirSync(parentDir, { recursive: true });
}
// 创建新的或打开现有的数据库
const db = new sqlite3.Database(databasePath, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');
  }
});

class Database {
  constructor() {
    this.db = new sqlite3.Database(databasePath, (err) => {
      if (err) {
        console.error('Could not connect to database', err);
      }
    });
  }

  // 获取数据库表的列名
  async getColumns(table) {
    return new Promise((resolve, reject) => {
      this.db.all(`PRAGMA table_info(${table});`, (err, rows) => {
        if (err) {
          console.log('err: ', table);
          reject(err.message);
        }
        resolve(rows.map((row) => row.name));
      });
    });
  }
  // 获取tables中的列名
  getCurrColumns(table) {
    const currTable = tables.find((item) => item.name === table);
    return currTable.columns.map((column) => column.split(' ')[0]);
  }
  // 插入或更新数据
  async insertOrUpdate(table, data, uniqueKey) {
    const columns = this.getCurrColumns(table);
    const insertData = {};
    insertData.createTime = new Date().getTime();
    const updateData = {};
    updateData.updateTime = new Date().getTime();

    for (let key in data) {
      if (columns.includes(key)) {
        insertData[key] = data[key];
        if (key !== uniqueKey) {
          updateData[key] = data[key];
        }
      }
    }

    const keys = Object.keys(insertData);
    const placeholders = keys.map(() => '?').join(', ');
    const updateAssignments = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(', ');

    const sql = `INSERT INTO ${table} (${keys.join(
      ', '
    )}) VALUES (${placeholders}) 
                 ON CONFLICT(${uniqueKey}) DO UPDATE SET ${updateAssignments}`;

    const insertValues = Object.values(insertData);
    const updateValues = Object.values(updateData);

    // Combine insertValues and updateValues for the full parameter list for the SQL statement
    const parameters = [...insertValues, ...updateValues];

    return new Promise((resolve, reject) => {
      this.db.run(sql, parameters, function (err) {
        if (err) {
          reject({ message: err.message, sql, parameters });
        } else {
          resolve(this.changes); // 返回被影响的行数
        }
      });
    });
  }
  // 插入数据，如果 uniqueKey 的值不存在
  async insertIfNotExist(table, data, uniqueKey) {
    const exists = await new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(1) AS count FROM ${table} WHERE ${uniqueKey} = ?`,
        [data[uniqueKey]],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count > 0);
          }
        }
      );
    });

    if (!exists) {
      return this.insert(table, data);
    } else {
      throw new Error(`UNIQUE constraint failed: ${uniqueKey}`);
    }
  }
  // 插入数据
  async insert(table, data) {
    data.createTime = new Date().getTime();
    const columns = this.getCurrColumns(table);
    const filteredData = {};

    for (let key in data) {
      if (columns.includes(key)) {
        filteredData[key] = data[key];
      }
    }

    // 移除 'id' 键，让数据库自动生成这个值
    delete filteredData.id;
    const keys = Object.keys(filteredData).join(',');
    const values = Object.values(filteredData)
      .map((value) => `'${value}'`)
      .join(',');

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO ${table} (${keys}) VALUES (${values})`,
        function (err) {
          if (err) {
            reject(err.message);
          }
          if (this && this.lastID) {
            resolve(this.lastID); // 返回新插入的行ID
          } else {
            resolve(null);
          }
        }
      );
    });
  }
  // 查询数据
  // 假设 getCurrColumns 是一个同步函数
  async select(table, conditions = '') {
    if (conditions === '') {
    } else if (!conditions.toLowerCase().includes('where')) {
      conditions = 'WHERE ' + conditions;
    }
    const columns = this.getCurrColumns(table);
    let sql = `SELECT ${columns.join(', ')} FROM ${table} ${conditions}`;
    console.log('sql:', sql);
    try {
      let rows = await new Promise((resolve, reject) => {
        this.db.all(sql, [], (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        });
      });
      return rows;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // 更新数据
  async update(table, data, conditions) {
    const columns = this.getCurrColumns(table);
    data.updateTime = new Date().getTime();
    const filteredData = {};

    for (let key in data) {
      if (columns.includes(key)) {
        filteredData[key] = data[key];
      }
    }
    delete filteredData.id;
    delete filteredData.customerOrderId;

    const assignments = Object.entries(filteredData)
      .map(([key, value]) => `${key} = ?`)
      .join(', ');

    const values = Object.values(filteredData);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE ${table} SET ${assignments} WHERE ${conditions}`,
        values,
        function (err) {
          if (err) {
            reject(err.message);
          } else {
            resolve(this.changes); // 返回被影响的行数
          }
        }
      );
    });
  }

  // 删除数据
  delete(table, conditions) {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM ${table} WHERE ${conditions}`, function (err) {
        if (err) {
          reject(err.message);
        }
        resolve(); // 返回被影响的行数
      });
    });
  }

  // 关闭数据库连接
  close() {
    this.db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Closed the database connection.');
    });
  }
}
function initializeDatabase() {
  // 初始化数据库结构
  db.serialize(() => {
    // 创建 order 表
    tables.forEach((table) => {
      db.run(
        `CREATE TABLE IF NOT EXISTS ${table.name} (${table.columns.join(',')})`,
        [],
        function (err) {
          if (err) {
            return console.error(
              `CREATE TABLE IF NOT EXISTS ${table.name} (${table.columns.join(
                ','
              )})`,
              err.message
            );
          }
        }
      );
      const Db = new Database();
      // 判断columns是否一致,不一致则增columns
      // 删除字段不好实现，暂时不考虑
      Db.getColumns(table.name).then((columns) => {
        // console.log('columns: ', columns);
        const columnsMap = {};
        columns.forEach((column) => {
          // Here we're just grabbing the column name, not the entire column definition
          columnsMap[column] = true;
        });

        table.columns.forEach((column) => {
          // Here we're just grabbing the column name, not the entire column definition
          const columnName = column.split(' ')[0];
          if (!columnsMap[columnName]) {
            // Add column
            try {
              db.run(
                `ALTER TABLE ${table.name} ADD COLUMN ${column}`,
                [],
                function (err) {
                  if (err) {
                  }
                }
              );
            } catch (e) { }
          }
        });
      });
    });
  });
}
async function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        console.log('Closed the database connection.');
        resolve();
      }
    });
  });
}
module.exports = {
  Database,
  initializeDatabase,
  closeDatabase,
};
