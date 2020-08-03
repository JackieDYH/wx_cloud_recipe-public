// pages/recipelist/recipelist.js

import api from '../../utils/api';
import config from '../../utils/config';
import storage from '../../utils/storage'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',//分类id
    type:'0',//判断如何才行菜谱列表
    recipePage: 1, //当前菜谱分页页码
    recipeLimit: 10, //分页的限制
    recipeList:[],//菜谱列表
    isshow:false,//更多的 显示/隐藏控制属性
    isshowNo:true,
    keyword:'',//用户搜索关键词
  },

  // 更加点击商品，跳转对应详情页
  _goToRecipeDetail(e){
    const {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}`,
    })
  },


  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    // console.log(options)
    const {id,typeName,keyword = '',type = '0'} = options;

    // 设置标题
    wx.setNavigationBarTitle({
      title: typeName || '菜谱列表',
    });
    // type 0 默认分类 | 1 首页跳转展示热门推荐 | 2 搜索跳转页面列表 | 3 个人中心跳转展示 用户发布的菜谱
    this.setData({type,keyword})
    this.data.id = id;//设置id 这个不需要页码展示 可以直接赋值
    this.getRecipeList(this.data.recipePage);
  },

  // 当前分类无菜谱时 返回上一级
  goToBack(){
    if(this.data.recipeList.length == 0){
      api._showToast({
        title:'分类下无菜谱...'
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta: -1,
        })
      },2000)
    }
  },

  async getRecipeList(page){
    try{
      const recipeTypeId = this.data.id;
      // 如果请求到最后一页，就不请求了
      if(this.data.isshow){
        return false;
      }
      api._showLoading();

      let where,orderBy,orderBy1;
      if(this.data.type == '0'){//默认方式 分类列表
        where = {status:1,examine:1,recipeTypeId};
        orderBy = {field:'views',sort:'desc'};
        orderBy1 = {field:'times',sort:'desc'};
      }else if(this.data.type == '1'){//全部菜谱 热门推荐
        where = {status:1,examine:1};
        orderBy = {field:'follows',sort:'desc'};
        orderBy1 = {field:'views',sort:'desc'};
      }else if(this.data.type == '2'){//用户模糊搜索列表
        where = {status:1,examine:1,recipeName:api.db.RegExp({
          regexp:this.data.keyword,
          options:'i',
        })};
        orderBy = {field:'views',sort:'desc'};
        orderBy1 = {field:'times',sort:'desc'};
      }else if(this.data.type == '3'){//个人中心 展示当前用户发布菜谱列表
        const _openid = storage._getStorage("_openid");
        where = {status:1,examine:1,_openid,recipeTypeId};
        orderBy = {field:'times',sort:'desc'};
        orderBy1 = {field:'views',sort:'desc'};
      }
      const recipeListRes = await api.find(config.tables.recName,where,page,this.data.recipeLimit,orderBy,orderBy1);
      // console.log(recipeListRes,'res')
      if(recipeListRes.data.length == 0){
        // 返回上级
        this.goToBack()

        this.setData({
          isshow:true,//没有更多的提示显示
        })
        wx.hideLoading();
        return false;
      }

      //请求到的数据，如果长度小于this.data.limit,就让更多显示
      if(recipeListRes.data.length < this.data.recipeLimit){
        this.setData({
          isshow:true
        })
      }

    // 1处理对应菜谱的用户信息
    let userPromises = [];//存储查询的所有用户的promise对象
    recipeListRes.data.forEach(item=>{
      let userPromise = api.find(config.tables.usersName,{_openid:item._openid});
      userPromises.push(userPromise);
    });
    // 2取到所有菜谱对应的用户信息
    let userRes = await Promise.all(userPromises);
    // console.log(userRes,'resss')
    // 给每条菜谱添加对应的用户信息
    recipeListRes.data.forEach((item,index)=>{
      item.userInfo = userRes[index].data[0].userInfo;
    });

    wx.hideLoading();
    // console.log(recipeListRes)
    this.setData({
      recipeList:this.data.recipeList.concat(recipeListRes.data)
    })

    }catch(err){
      wx.hideLoading();
      api._showToast({title:"占无菜谱信息"});
      console.log(err,'数据加载出错')
    }
  },

  // 页面上拉触底事件的处理函数 滑到底部请求下一页
  onReachBottom: function () {
    this.data.recipePage++;
    this.getRecipeList(this.data.recipePage);
  },

})