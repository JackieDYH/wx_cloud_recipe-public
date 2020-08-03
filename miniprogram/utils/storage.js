// 操作本地存储

// 获取本地存储对应key
const _getStorage = (key)=>{
  return wx.getStorageSync( key );
}

// 设置本地存储对应key
const _setStorage = (key,value)=>{
  return wx.setStorageSync( key,value );
}

// 清除全部本地存储
const _clearStorage = ()=>{
  wx.clearStorageSync();
}

// 清除指定key本地存储
const _removeStorage = ( key )=>{
  wx.removeStorageSync( key );
}

export default {
  _getStorage,
  _setStorage,
  _clearStorage,
  _removeStorage
}