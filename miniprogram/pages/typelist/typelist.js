// pages/typelist/typelist.js

import api from '../../utils/api';
import config from '../../utils/config';
import storage from '../../utils/storage';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recipeTypeList:[],//菜谱分类列表
    keyword:'',//搜索关键词
  },
  // 监听输入框变化
  _changeKeyword(e){
    let keyword = e.detail.value.trim();
    this.setData({
      keyword
    })
  },

  // 跳转搜索列表页 模糊搜索
  _goSearchList(){
    if(!this.data.keyword){
      api._showToast({title:"关键词不能为空..."});
      return false;
    }

    // 追加前面unshift 不能重复 本地存储
    let keywords = storage._getStorage("keywords") || [];//取出数据 | 判断是否本地有数据
    const keyword = this.data.keyword;//要搜索的关键词
    this.setData({
      keyword:''
    })
    // 判断本地是否有该数据
    const index = keywords.findIndex(item=>{
      return item == keyword
    })
    // 判断本地数据是否大于规定个数
    if(keywords.length >=this.data.keywordLimit){
      keywords.pop();//删除最后一个
    }
    // 没找到 -1 添加 / 找到 对应下标 删除 头部添加
    if(index !== -1){
      keywords.splice(index,1);//删除对应位置数据
    }
    keywords.unshift(keyword);
    storage._setStorage('keywords',keywords);
    wx.navigateTo({
      url:`/pages/recipelist/recipelist?&keyword=${keyword}&type=2`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllREcipeType();
  },

  // 跳转分类列表
  _goToRecipeList(e){
    console.log(e)
    const { id,typeName} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipelist/recipelist?id=${id}&typeName=${typeName}`,
    })
  },

  // 获取菜谱分类
  async getAllREcipeType(){
    try{
      const recipeTypeRes = await api.findAll(config.tables.recTypeName);
      // console.log(recipeTypeRes)
      this.setData({
        recipeTypeList:recipeTypeRes.data
      })
    }catch(err){
      console.log(err,'菜谱分类获取失败')
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})