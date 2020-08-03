// pages/pbmenutype/pbmenutype.js

import Config from '../../utils/config';
import api from '../../utils/api';
import storage from '../../utils/storage';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowAdd:false,//添加框
    isShowEdit:false,//修改框
    typeName:'',//要添加分类名
    recipeList:[],//菜谱分类列表
    editId:'',//需要修改的id
    isShow:false,//权限

  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api._showLoading();
  },
      
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取菜单列表数据
    this._getRecipeTypeList();
    this.setData({
      isShow:storage._getStorage("isShow")
    })
  },

  // 监听 获取输入框中数据
  _eventInput(e){
    this.setData({
      typeName:e.detail.value
    })
    // console.log(e)
  },
  // 添加框显示/隐藏
  _isShowAdd(){
    this.setData({
      isShowAdd:!this.data.isShowAdd,
      isShowEdit:false,
      typeName:'',
      editId:''
    })
  },
  // 修改框显示/隐藏
  _isShowEdit(e){
    console.log(e.currentTarget.dataset.index);
    const typeIndex = e.currentTarget.dataset.index;
    const info = this.data.recipeList[typeIndex];
    // 给修改框赋值
    this.setData({
      isShowAdd:false,
      isShowEdit:!this.data.isShowEdit,
      typeName:info.typeName,
      editId:info._id
    })
  },
  // 设置为空
  setNull(){
    this.setData({
      typeName:'',
      isShowAdd:false,
      isShowEdit:false,
    })
  },

    // 从数据库获取所有菜谱分类数据
    async _getRecipeTypeList(){
      const listRes = await api.findAll(Config.tables.recTypeName);
      this.setData({
        recipeList:listRes.data
      })
      wx.hideLoading();
    },

  // 1 向数据库中添加数据
  async _doAdd(){
    let typeName = this.data.typeName.trim();
    // 判断typeName 是否为空
    if(!typeName){
      api._showToast({
        title:"分类名不能为空",
        duration:2000
      });
      this.setNull();
      return false;
    }

    // 2 在添加之前，先find 查找有无相同菜谱分类 无则添加
    // 查找元素 找到返回下标  否则-1
    const typeIndex = this.data.recipeList.findIndex(item=>{
      return item.typeName == typeName;
    })
    if(typeIndex != -1){
      api._showToast({
        title:"已有此类名"
      })
      this.setNull();
      return false;
    }

    const addResult = await api.add(Config.tables.recTypeName,{typeName});
    if(addResult._id){
      api._showToast({
        title:"添加成功",
        icon:"success"
      });
      this.setNull();
      // 刷新页面数据
      this._getRecipeTypeList();
    }else{
      api._showToast({
        title:"添加失败"
      })
    }
  },

  // 修改已添加数据
  async _doEdit(){
    const _id = this.data.editId;
    //tableName,_id='',data={}
    const editRes = await api.updateId(Config.tables.recTypeName,_id,{typeName:this.data.typeName});
    // 修改成功 updated为1 否则 0
    if(!editRes.stats.updated){
      api._showToast({
        title:"修改失败"
      });
      this.setNull();
      return false;
    }else{
      api._showToast({
        title:"修改成功",
        icon:"success"
      });
      this.setNull();
      // 刷新页面数据
      this._getRecipeTypeList();
    }
  },

  // 删除类名
  async _doRemove(e){
    this.setNull();
    // console.log(e.currentTarget.dataset.id)
    const _id = e.currentTarget.dataset.id;
    // 弹出确认提示框
    const removeRes = await api._showModal();
    if(removeRes.confirm){
      // 查看当前分类下是否有菜谱 有提示不能删除
      console.log(_id)
      const recipesRes = await api.find(Config.tables.recName,{recipeTypeId:_id})
      if(recipesRes.data.length !== 0){
        api._showToast({
          title:"分类下有菜谱",
          icon:"loading"
        })
        return false;
      }

      const removeStats = await api.removeId(Config.tables.recTypeName,_id);
      if(removeStats){
        api._showToast({
          title:"删除成功",
          icon:"success"
        });
        // 刷新数据页面
        this._getRecipeTypeList();
      }else{
        api._showToast({
          title:"删除失败",
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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