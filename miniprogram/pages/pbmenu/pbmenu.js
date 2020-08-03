// pages/pbmenu/pbmenu.js

/*
_id: 每次添加菜谱自动生成的 唯一的
_openid:此条记录是哪个用户添加的（可以重复）
recipeName :菜谱名称
recipeTypeId：菜谱分类的id
fileIds:[] 存储的是菜谱中的一些图片的地址
recipeMakes: string
follows:收藏的个数
views:浏览次数
status:1( 代表是否删除    1 代表正常、2代表用户删除了 )
*/

import api from '../../utils/api';
import config from '../../utils/config';
import storage from '../../utils/storage';

Page({
  data: {
    recipesList: [], //菜谱分类
    filesList: [], //要上传的图片列表 {url:""}
    isShow:false,//控制属性
  },

  onLoad() {
    // 页面加载效果
    api._showLoading();

    this.getRecipesList();
  },

  onShow(){
    this.setData({
      isShow:storage._getStorage("isShow")
    })
  },

  // 1 获取数据库菜谱分类
  async getRecipesList() {
    const recipesRes = await api.findAll(config.tables.recTypeName);
    this.setData({
      recipesList: recipesRes.data
    })
    wx.hideLoading()
  },

  //选择图片，把获取到的图片更新到filesList变量中
  _chooseImage(e) {
    // console.log(e)
    const tempFilePaths = e.detail.tempFilePaths;
    let filesList = tempFilePaths.map(item => {
      return {
        url: item
      }
    })
    this.setData({
      filesList
    })
  },

  // 删除某张图片 更新filesList
  _deleteImage(e) {
    // console.log(e)
    this.data.filesList.splice(e.detail.index, 1);
  },

  // 添加处理完毕的数据到数据库中
  async _doRecipe(e) {
    //form表单 收集用户提交的数据
    // console.log(e)
    /*
      recipeName :菜谱名称
      recipeTypeId：菜谱分类的id
     
      recipeMakes: string
      follows:收藏的个数
      views:浏览次数
      status:1( 代表是否删除    1 代表正常、2代表用户删除了 ) 
      fileIds:[] 存储的是菜谱中的一些图片的地址  
        add添加数据
     */
    // 判断用户是否填写完整
    const recipeName = e.detail.value.recipeName;//名称
    const recipeTypeId = e.detail.value.recipeTypeId;//分类id
    const recipeMakes = e.detail.value.recipeMakes;//做法
    const recipeMater = e.detail.value.recipeMater;//用料
    if(this.data.filesList.length ==0 || recipeName=='' || recipeTypeId=='' || recipeMakes=='' || recipeMater==''){
      api._showToast({title:"请 填写完整"});
      return false;
    }

    // 文件上传
    let filesList = this.data.filesList;
    const uploadRes = await api._uploader(filesList)
    // console.log(uploadRes)
    if(uploadRes.length !== filesList.length){
      api._showToast({title:"上传出错"});
      return false;
    }

    const fileIds = uploadRes.map(item=>{
      return item.fileID
    })

    // 处理 数据格式
    let recipeInfo = {};
    recipeInfo.recipeName = recipeName;
    recipeInfo.recipeTypeId = recipeTypeId;
    recipeInfo.recipeMakes = recipeMakes;
    recipeInfo.recipeMater = recipeMater;
    recipeInfo.status = 1;//是否删除状态 1 已发布 2 未审核
    recipeInfo.examine = 2;//菜谱发布状态 1 已发布 2 未审核
    recipeInfo.views = 0;//浏览次数
    recipeInfo.follows = 0;//收藏个数
    recipeInfo.fileIds = fileIds;//图片
    recipeInfo.times = new Date();//发布时间

    // console.log(recipeInfo)

    const addRes = await api.add(config.tables.recName,recipeInfo);
    // console.log(addRes,1111111)

    if(!addRes._id){
      api._showToast({title:"发布失败"});
    }else{
      // 当发布成功 rec-userPbType表中是否有菜谱分类 有则跳过 无则添加
      const typeRes = await api.find(config.tables.userPbType,{recipeTypeId});
      if(typeRes.data.length == 0){
        const typeaddRes = await api.add(config.tables.userPbType,{recipeTypeId});
      }

      api._showToast({title:"发布成功待审核",icon:"success"});
      setTimeout(()=>{
        wx.reLaunch({
          url: '/pages/personal/personal'
        })
      },2000)
    }


  }


})