// pages/recipeDetail/recipeDetail.js

import api from '../../utils/api';
import config from '../../utils/config';
import storage from '../../utils/storage';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    recipeInfo:[],//菜谱详情
    userInfo:[],//用户信息
    isShow:false,//关注状态
  },

  // 用户关注 有则更新 无则添加 需要登录才能关注 未登录提示登录
  async _setFollow(){
    // console.log(this.data.recipeInfo._id,11111111)
    try{
      // 检测是否登录 未登录跳转catch
      const checkSessionRes = await api._checkIsLogin();
      
      let title = '关注成功';
      let icon = "loading";
      let follows = 1;//关注量
      let status;//关注的状态
      let isShow;//显示隐藏

      // status 1 表示关注 2 取消
      // recipeId 菜谱id
      // 查询获取关注状态
      const _openid = storage._getStorage("_openid");
      const updatedRes = await api.find(config.tables.userfollow,{_openid,recipeId:this.data.recipeInfo._id});
      // console.log(updatedRes,updatedRes.data.length,'查询')
      // return
      if(updatedRes.data.length == 0){
        // 数据表中无记录 添加状态
        const fllowRes = await api.add(config.tables.userfollow,{recipeId:this.data.recipeInfo._id,status:1,examine:1});
        
        // 更新浏览量数据
        follows = 1;
        ++this.data.recipeInfo.follows;
        icon = 'success';
        isShow = true;
      }else{
        if(updatedRes.data[0].status == 1){
          // 关注状态时 -> 取关
          follows = -1;
          --this.data.recipeInfo.follows;
          status = 2;
          isShow = false;
          title = '取消关注';
        }else{
          // 取关状态时 ->关注
          follows = 1;
          ++this.data.recipeInfo.follows;
          status = 1;
          isShow = true;
          title = '关注成功';
          icon = 'success';
        }
        // 更新状态 examine 1 上线状态
        const updateRes = await api.updateT(config.tables.userfollow,{_openid,recipeId:this.data.recipeInfo._id},{status,examine:1});
        
      }
      // 更新关注量
      const viewsRes = await api.updateId(config.tables.recName,this.data.recipeInfo._id,{follows:api._.inc(follows)});
      // console.log(viewsRes,follows,'num')
      // 更新数据
      this.setData({
        recipeInfo:this.data.recipeInfo,
        isShow,
      })
      api._showToast({
        title,
        icon,
        duration:1000
      })
    }catch(err){
      api._showToast({
        title:'亲 先登录',
        icon:'loading'
      })
      console.log(err,'关注失败')
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api._showLoading();
    // console.log(options,'id')
    this._getrecipeInfo(options.id)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 根据id获取菜谱详情数据
  async _getrecipeInfo(_id){
    try{
      // 获取菜单数据
      const recipeRes = await api.findId(config.tables.recName,_id);
      
      // 判断当前菜单是否已被标记删除
      if(recipeRes.data.status == 2){
        api._showLoading({title:"菜谱已被删除..."});
        setTimeout(()=>{
          wx.showLoading();
          wx.navigateBack({
            delta: -1,
          })
        },2000);
        return false;
      }

      // 根据菜单数据中用户openid查询用户名
      const userInfo = await api.find(config.tables.usersName,{_openid:recipeRes.data._openid});
      // 根据登录用户openid 查关注表 判断当前用户是否关注
      // 获取登录用户openid
      const _openid = storage._getStorage("_openid");
      if(_openid !== ''){
        const isfollow = await api.find(config.tables.userfollow,{_openid,recipeId:recipeRes.data._id});
        // console.log(isfollow,'初始化判断 关注')
  
        // 修改关注按钮状态
        if(isfollow.data.length!==0 && isfollow.data[0].status !==2 ){
          this.setData({
            isShow:true,
          })
        }
      }

      // 更新浏览量数据 使用提供的 _.inc()实现增加或减少
      const views = ++recipeRes.data.views;
      const viewsRes = await api.updateId(config.tables.recName,_id,{views:api._.inc(1)});//自增1
      // console.log(recipeRes.data.views,views,viewsRes,'num')

      // console.log(userInfo,11)
      // 设置标题文字
      wx.setNavigationBarTitle({
        title: recipeRes.data.recipeName,
      })
      this.setData({
        recipeInfo:recipeRes.data,
        userInfo:userInfo.data[0].userInfo
      })
      // 关闭加载效果
      wx.hideLoading();
    
    } catch(err){
      console.log(err,'详情获取错误')
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
    // 分享属性
    return {
      title:`${this.data.recipeInfo.recipeName} 美食`,
    }
  }
})