/*
 * @Description: 
 * @Date: 2025-04-29 10:33:28
 * @LastEditTime: 2025-04-29 17:12:21
 */

// let total = 0;
// let pageSize = 50;
// let pageNum = 1;
// let list = [];
// let isEnd = false;
// const getList = () => {
//   return new Promise(resolve => {
//     fetch('https://dyjfalk.court.gov.cn/dyjfAlkInternet-admin/s', {
//       method: 'POST', // 指定请求方法为 POST
//       headers: {
//         'Content-Type': 'application/json',
//         authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImFjMGI1MTUyLTFjMWItNDhhMi1iY2VkLWFhYjBkY2QzN2NjOCJ9.m5nXT05z4q1-LINbWC0IQbVxGzz_mBObCBIIJ4NVQ_iH8kOrq0keGKK2CFfutNSgozWkHe2-b4nnZJkYLUSfVQ'
//       },
//       body: JSON.stringify({
//         pageNum,
//         pageSize,
//         "orderByColumn":"caseWarehousingTime",
//         "searchConditions":[]
//       })
//     }).then(response => response.json()).then(data=>{
//       total = data.total || 0;
//       list = list.concat(data.rows);
//       resolve(pageNum * pageSize >= data.total)
//     }).catch(e => {
//       resolve(false);
//     })
//   })
  
// }
const delay = (time) => {
  return new Promise(resolve => {
    time = time + (3000 * Math.random() * (Math.random() > 0.5 ? 1 : -1));
    setTimeout(() => {
      resolve(true);
    }, time);
  })
}
// while(!isEnd) {
//   isEnd = await getList();
//   if(!isEnd) {
//     pageNum++;
//   }
//   await delay(8000);
// }


const downLoad = (caseId, fileName) => {
  return new Promise(resolve => {
    const formData = new FormData();
    formData.append('fileType', 'pdf');
    fetch(`https://dyjfalk.court.gov.cn/dyjfAlkInternet-admin/bsalgl/case/${caseId}/export`, {
      method: 'POST', // 指定请求方法为 POST
      headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded',
        authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImFjMGI1MTUyLTFjMWItNDhhMi1iY2VkLWFhYjBkY2QzN2NjOCJ9.m5nXT05z4q1-LINbWC0IQbVxGzz_mBObCBIIJ4NVQ_iH8kOrq0keGKK2CFfutNSgozWkHe2-b4nnZJkYLUSfVQ'
      },
      body: formData
    }).then(response => response.blob()).then(blob=>{
      console.log(blob)
      console.log(blob.size);
      if(blob.size < 1024) {
        resolve(false);
        return;
      }
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}`;
      document.body.appendChild(link)
      link.click()
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
      resolve(true)
    }).catch(e => {
      console.log('e----', e)
      resolve(false);
    })
  })
}
let downLoadList = [];
for(let i = 0; i< list.length; i++) {
  if(!downLoadList.includes(i)) {
    console.log(i+1, '--', list.length);
    let res = await downLoad(list[i].caseId, `${list[i].caseCodeName}-${list[i].disputeCodeName}-${list[i].caseTitle}.pdf`);
    if(!res) {
      return;
    }
    downLoadList.push(i);
    console.log(JSON.stringify(downLoadList));
    await delay(7000);
  }
  
}




const detailList = [];
const getCaseDetail = (caseId, caseCodeName) => {
  return new Promise(resolve => {
    fetch(`https://dyjfalk.court.gov.cn/dyjfAlkInternet-admin/bsalgl/case/${caseId}?noStyle=true`, {
      method: 'POST', // 指定请求方法为 POST
      headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded',
        authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImY5MDhjYWM1LWQwZjctNDZiNS1hNWE3LTczMzhiNjE1YjdkMiJ9.cb7RlGQePrdU_A1a6gfZ5H2tgInW_PYAWHVtLKvW7QpHFeUIVU3u_pZ7YirQFiWLPmX5Fqwl1r1NbwaLpVew9A'
      },
      body: {}
    }).then(response => response.json()).then(res=>{
      console.log(res)
      const { data } = res;
      const { caseContent = {}, caseRecommendDepInfoList = [], caseResolveUnitsInfoList = [] } = data;
      const arr = [
        {
          title: '基本案情',
          content: caseContent.caseBaseIfno
        },
        {
          title: '处理方式方法',
          content: caseContent.caseProcessMethod
        },
        {
          title: '处理结果',
          content: caseContent.caseSolutionResault
        },
        {
          title: '解纷依据',
          content: caseContent.caseAccording
        },
        {
          title: '解纷要旨',
          content: caseContent.caseGist
        },
        {
          title: '推荐部门',
          content: caseRecommendDepInfoList.map(item=>item.caseRecommendDepName).join(',')
        },
        {
          title: '化解单位（调解组织）',
          content: caseResolveUnitsInfoList.map(item=>item.caseResolveUnitsName).join(',')
        },
        
      ]
      let obj = {
        caseCodeName,
        caseNo: data.caseNo,
        caseTitle: data.caseTitle,
        caseSubTitle: data.caseSubTitle,
        caseKeywordList: data.caseKeywordList.filter(item => item.caseKeyword).map(item=>item.caseKeyword).join(','),
        contentList: arr
      };
      detailList.push(obj);
      resolve(true)
    }).catch(e => {
      console.log('e----', e)
      resolve(false);
    })
  })
}


for(let i = 0; i < list.length; i++) {
  console.log(i, '--', list.length);
  let caseData = list[i];
  const arr = [
    {
      title: '基本案情',
      content: caseData.caseBaseIfno
    },
    {
      title: '处理方式方法',
      content: caseData.caseProcessMethod
    },
    {
      title: '处理结果',
      content: caseData.caseSolutionResault
    },
    {
      title: '解纷依据',
      content: caseData.caseAccording
    },
    {
      title: '解纷要旨',
      content: caseData.caseGist
    },
    {
      title: '推荐部门',
      content: caseData.recommendDepInfos.map(item=>item.caseRecommendDepName).join(',')
    },
    {
      title: '化解单位（调解组织）',
      content: caseData.resolveUnitsInfos.map(item=>item.caseResolveUnitsName).join(',')
    },
    
  ]
  let obj = {
    caseCodeName: `${caseData.caseCodeName}-${caseData.disputeCodeName}`,
    caseNo: caseData.caseNo,
    caseTitle: caseData.caseTitle,
    caseSubTitle: caseData.caseSubTitle,
    caseKeywordList: caseData.keywords.join(','),
    contentList: arr
  };
  detailList.push(obj);
}
