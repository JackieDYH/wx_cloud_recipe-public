// index.js

import api from '../../utils/api';
import config from '../../utils/config';
import storage from '../../utils/storage';

Page({
  // 页面的初始数据
  data: {
    hotRecipeList:[],//热门菜谱信息
    recipeTypeList:[],//展示菜谱分类 2条
    keyword:'',//搜索关键词
    recipePage: 1, //当前菜谱分页页码
    recipeLimit: 8, //分页的限制
    isload: true, //判断是否允许获取新数据 向下滑动时

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

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    this.getHotRecipeList(this.data.recipePage);
    this.getAllRecipeType();
  },

  // 生命周期函数--监听页面显示

  onShow: function () {

  },

  // 获取2个菜谱分类
  async getAllRecipeType(){
    try{
      const recipeTypeRes = await api.findAll(config.tables.recTypeName);
      // 取前2条
      // console.log(recipeTypeRes)
      this.setData({
        recipeTypeList:recipeTypeRes.data.slice(0,2)
      })
    }catch(err){
      api._showToast({title:"暂无菜谱数据"});
      console.log(err,'菜谱分类获取失败')
    }
  },

  // 跳转菜谱列表页 传分类id 和菜谱分类名称
  // 推荐菜谱/热门菜谱跳转
  _goToRecipeList(e){
    const { id,typeName,type='0' } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipelist/recipelist?id=${id}&typeName=${typeName}&type=${type}`,
    })
  },

  // 更加点击商品，跳转对应详情页
  _goToRecipeDetail(e){
    const {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}`,
    })
  },

  // 跳转菜谱分类
  _goToRecipeType(){
    wx.navigateTo({
      url: '/pages/typelist/typelist',
    })
  },

  // 获取热门菜谱 根据浏览量 和关注度排序 处理用户信息
  async getHotRecipeList(page){
    try{
      api._showLoading();
      // 获取热门菜谱
      const hotRes = await api.find(config.tables.recName,{status:1,examine:1},page,this.data.recipeLimit,{field:'views',sort: "desc"},{field:'follows',sort: "desc"});
      // console.log(hotRes,'列表')
    // 1处理对应菜谱的用户信息
    let userPromises = [];//存储查询的所有用户的promise对象
    hotRes.data.forEach(item=>{
      let userPromise = api.find(config.tables.usersName,{_openid:item._openid});
      userPromises.push(userPromise);
    });
    // 2取到所有菜谱对应的用户信息
    let userRes = await Promise.all(userPromises);
    // console.log(userRes,'resss')
    // 给每条菜谱添加对应的用户信息
    hotRes.data.forEach((item,index)=>{
      item.userInfo = userRes[index].data[0].userInfo;
    });
    this.setData({
      hotRecipeList:hotRes.data
    })
    wx.hideLoading();
    }catch(err){
      wx.hideLoading();
      api._showToast({title:"暂无菜谱数据"});
      console.log(err,'热门菜谱获取错误')
    }
  },

  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    
  },

  // 页面上拉触底事件的处理函数
  onReachBottom: function () {
    
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    
  }
})