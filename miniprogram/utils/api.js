// APi接口 封装

// 操作数据库
const db = wx.cloud.database();
const _ = db.command;

// 添加数据 Promise方式
const add = ( tableName, data={} )=>{
  return db.collection(tableName).add({ data });
}

// 查找数据
// 分页处理
const find = ( tableName, where={},page,limit=8,orderBy={field:'_id',sort:'desc'},orderBy1)=>{
  if(page!==undefined){
    let skip = ( page - 1 ) * limit;
    // 两个排序依据
    if(orderBy1==undefined){
      return db.collection(tableName).where(where).limit(limit).skip(skip).orderBy(orderBy.field,orderBy.sort).get();
    }else{
      return db.collection(tableName).where(where).limit(limit).skip(skip).orderBy(orderBy.field,orderBy.sort).orderBy(orderBy1.field,orderBy1.sort).get();
    }
  }else{
    return db.collection(tableName).where( where ).get();
  }
}

// 查找一个数据
const findId = (tableName, _id)=>{
  return db.collection(tableName).doc(_id).get();
}

// 查找集合中所有数据
const findAll = async(tableName, where={})=>{
  const MAX_LIMIT = 20 //每次小程序的限制是20条
    // 先取出集合记录总数
  const countResult = await db.collection(tableName).where(where).count()//获取一共多少条数据
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(tableName).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}

// 查找更新
const updateId = (tableName,_id='',data={})=>{
  return db.collection(tableName).doc(_id).update({data});
}
// 按条件更新
const updateT = (tableName, where={},data={})=>{
  return db.collection(tableName).where( where ).update({data});
}

// 查找 删除
const removeId = (tableName,_id='')=>{
  return db.collection(tableName).doc(_id).remove();
}
// 按条件删除
const removeT = (tableName,where={})=>{
  return db.collection(tableName).where( where ).remove();
}

// 判断用户是否登录
const _checkIsLogin = ()=>{
  return new Promise((resolve,reject)=>{
    wx.checkSession({
      success: resolve,
      fail:reject
    })
  })
}

//用户登录
const _login = ()=>{
  return new Promise((resolve,reject)=>{
    wx.login({
      success:resolve,
      fail:reject
    })
  })
}

// 调用云函数
const _cloudFunction = (name,data={})=>{
  return new Promise((resolve,reject)=>{
    wx.cloud.callFunction({
      name,
      data,
      success:resolve,
      fail:reject
    })
  })
}

// 对比两个对象的值是否完全相等 返回值 true/false
const _isObjectValueEqual = (a, b) => {
  //取对象a和b的属性名
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);
  //判断属性名的length是否一致
  if (aProps.length != bProps.length) {
    return false;
  }
  //循环取出属性名，再判断属性值是否一致
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}


// 文件上传功能
const _uploader = (filePaths)=>{
  let fileUploaderPormise = [];//存储所有promises对象集合
  // forEach 同步执行 瞬间完成
  filePaths.forEach((item,index)=>{
    // 获取文件扩展名
    const type = item.url.split(".").pop();
    const fileName = `${new Date().getTime()}-${index}.${type}`;
    //这是异步的，有网络延迟  我怎么知道所有的文件都上传成功了  Promise.all
    let uploaderPromise = wx.cloud.uploadFile({
      cloudPath:`recipes/${fileName}`,//存储到云存储的路径 包括文件名
      filePath:item.url,//本地临时路径地址
    });
    fileUploaderPormise.push(uploaderPromise);
  })
  return Promise.all(fileUploaderPormise);
}


// 微信小程序官方交互Api 二次封装 success loading
// wx.showToast()方法封装
const _showToast = ({title='提示',icon='none',mask=false,duration=2000})=>{
  wx.showToast({
    title,
    icon,
    mask,
    duration
  })
}

// wx.showModal
const _showModal = (options = {})=>{
  let {title='菜谱君温馨提示',content='确定要删除吗'} = options;
  return new Promise((resolve,reject)=>{
    wx.showModal({
      title,
      content,
      success:resolve,
      fail:reject
    })
  })
}

// wx.showLoading
const _showLoading = (options = {})=>{
  let {title="加载中...",mask=false} = options;
  return new Promise((resolve,reject)=>{
    wx.showLoading({
      title,
      mask,
    })
  })
}


export default {
  _,
  db,
  add,
  find,
  findId,
  findAll,
  updateId,
  updateT,
  removeId,
  removeT,
  _showToast,
  _showModal,
  _showLoading,
  _uploader,
  _checkIsLogin,
  _login,
  _cloudFunction,
  _isObjectValueEqual
}