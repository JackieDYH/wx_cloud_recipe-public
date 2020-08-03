// pages/search/search.js

import api from '../../utils/api';
import config from '../../utils/config';
import storage from '../../utils/storage';

Page({
  // 页面的初始数据
  data: {
    hotList:[],//热门搜索
    historySearch:[],//近期搜索
    keyword:'',//搜索关键词
    keywordLimit:6,//最多缓存条数
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {

  },

  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {

  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    this.getHotLiset();
    this.getHistorySearch();
  },

  // 获取最近搜索记录
  getHistorySearch(){
    this.setData({
      historySearch:storage._getStorage("keywords") || []
    })
  },

  // 监听输入框变化 去除空格
  _changeKeyword(e){
    let keyword = e.detail.value.trim();
    // console.log(keyword)
    this.setData({
      keyword
    })
  },

  // 点击最近搜索跳转列表页
  _goToList(e){
    const {keyword} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipelist/recipelist?keyword=${keyword}&type=2`,
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

  // 清空本地搜索记录
  _removebtn(){
    storage._removeStorage("keywords");
    this.setData({
      historySearch:''
    })
  },



  // 按照views浏览量 follows关注量 desc排序 取9条
  async getHotLiset(){
    try{
      const hotRes = await api.find(config.tables.recName,{status:1,examine:1},1,9,{field:'views',sort:'desc'},{field:'follows',sort:'desc'});
      // console.log(hotRes,11)
      this.setData({
        hotList:hotRes.data
      })
    }catch(err){
      console.log(err,'热门菜谱获取失败')
    }
  },
  // 跳转对应详情页
  _goToRecipeDetail(e){
    const {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}`,
    })
  }
})