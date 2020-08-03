// pages/personal/personal.js
// 引入工具文件
import Api from '../../utils/api';
import Config from '../../utils/config';
import Storage from '../../utils/storage';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isload: true, //判断是否允许获取新数据 向下滑动时 菜单
    isload1: true, //判断是否允许获取新数据 向下滑动时 分类
    isload2: true, //判断是否允许获取新数据 向下滑动时 关注
    isload3: true, //判断是否允许获取新数据 向下滑动时 待审核
    isload4: true, //判断是否允许获取新数据 向下滑动时 已审核
    isLogin: false, //用户登录状态
    isAdmin: false, //判断是否管理员
    isShow:false,//权限判断
    userInfo: {}, //用户登录信息
    indexMenu: 0, //菜单选项索引 0： 菜单   1：分类   2：关注
    userPbRecipes: [], //当前用户发布的菜谱
    userTypeName: [], //当前用户发布过菜谱的分类名
    userFollowList:[],//用户关注的菜谱
    examineList:[],//审核用户发布的菜谱
    adoptList:[],//审核通过的菜谱
    recipePage: 1, //当前菜谱分页页码
    typePage: 1, //当前分类分页页码
    followPage: 1, //当前关注分页页码
    examinePage: 1, //当前待审核分页页码
    adoptPage: 1, //当前审核已通过分页页码
    recipLimit:8,//请求数据的个数
  },

  onLoad() {
    // 页面加载效果
    // Api._showLoading();

    // 页面加载完成执行一次
    this._ckeckIsLogin();

    Api._showToast({
      title: "加载中...",
      icon: "loading",
      duration: 1800
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    if(this.data.isLogin){
      this._getuserPbRecipes(this.data.recipePage);
    }
    // wx.hideLoading();
    // 菜谱添加按钮权限
    const isShow = await Config.getShow();
    Storage._setStorage("isShow",isShow);
    this.setData({
      isShow
    })
  },

  // 生命周期函数--监听页面隐藏
  onHide: function () {
    // 还原数据
    this.setData({
      userPbRecipes: [],
      userFollowList:[],
      examineList:[],
      adoptList:[],
      indexMenu: 0,
      recipePage: 1,
      followPage:1,
      examinePage: 1, 
      adoptPage: 1,
      isload:true,
      isload2:true,
      isload3:true,
      isload4:true,
    })
  },

  // 设置菜单选项
  _checkMenu(e) {
    const {index} = e.currentTarget.dataset;
    // console.log(index,'e')
    // 判断该请求哪个数据
    if(index == '0' && this.data.isload && this.data.isLogin){
      this._getuserPbRecipes(this.data.recipePage);
      // 还原数据
      this.setData({
        adoptList:[],
        adoptPage: 1,
        isload4:true,
        examineList:[],
        examinePage: 1,
        isload3:true,
      })
    }else if(index == '1' && this.data.isload1 && this.data.isLogin){
      this._getuserPbType(this.data.typePage);
    }else if(index == '2' && this.data.isload2 && this.data.isLogin){
      this._getuserFollow(this.data.followPage);
    }else if(index == '3' && this.data.isload3 && this.data.isLogin && this.data.isAdmin){
      this._getuserExamine(this.data.examinePage);
      // 还原数据
      this.setData({
        userFollowList:[],
        followPage: 1,
        isload2:true,
        adoptList:[],
        adoptPage: 1,
        isload4:true,
        isload: true,
        recipePage: 1,
        userPbRecipes: [],
      })
    }else if(index == '4' && this.data.isload4 && this.data.isLogin && this.data.isAdmin){
      this._getAdopt(this.data.adoptPage);
      // 还原数据
      this.setData({
        userFollowList:[],
        followPage: 1,
        isload2:true,
        examineList:[],
        examinePage: 1,
        isload3:true,
        isload: true,
        recipePage: 1,
        userPbRecipes: [],
      })
    }

    this.setData({
      indexMenu: e.currentTarget.dataset.index,
      // isload:true
    })
  },
  // 监听滑动 菜单变化
  _bindChange(e) {
    // console.log(e.detail.current)
    this.setData({
      indexMenu: e.detail.current
    })
  },

  // 1 获取当前用户发布菜谱列表
  async _getuserPbRecipes(page) {
    try{
      Api._showLoading();
      // 获取用户openid
      const _openid = Storage._getStorage("_openid");
      const recipesRes = await Api.find(
        Config.tables.recName, {
          _openid,
          status: 1,
          examine:1
        }, //按用户查询 返回status 1 为标记删除的展示
        page,//页码
        this.data.recipLimit, //一页几条数据
        {
          field: "times",
          sort: "desc"
        }
      );
        // 判断是否还有数据
        if(recipesRes.data.length < this.data.recipLimit){
          this.setData({
            isload:false
          })
          Api._showToast({
            title: "到底啦..."
          })
        }
      // console.log(recipesRes.data, 'recipesRes菜单列表');
      // if (recipesRes.data.length == 0) {
      //   Api._showToast({
      //     title: "别拉了 没有了..."
      //   })
      //   this.setData({
      //     isload:false
      //   })
      //   return false;
      // }
      // 合并刷新来的数据
      this.setData({
        userPbRecipes: this.data.userPbRecipes.concat(recipesRes.data)
      })
      wx.hideLoading();
    }catch(err){
      wx.hideLoading();
      Api._showToast({title:"暂无数据"});
      console.log(err,'菜谱列表获取失败')
    }
  },

  // 2 获取当前用户发布过菜谱的分类列表
  async _getuserPbType(page){
    try{
      Api._showLoading();
      // 获取当前登录用户openid
      const _openid = Storage._getStorage("_openid");
      // 获取所有用户发布过的菜谱分类id
      const typeIdRes = await Api.find(Config.tables.userPbType,{_openid},page,this.data.recipLimit);
      // 判断是否还有数据
      if(typeIdRes.data.length < this.data.recipLimit){
        this.setData({
          isload1:false
        })
        // Api._showToast({
        //   title: "到底啦..."
        // })
      }
      // console.log(typeIdRes,11);
      // if (typeIdRes.data.length == 0) {
      //   Api._showToast({
      //     title: "别拉了 没有了..."
      //   })
      //   this.setData({
      //     isload1:false
      //   })
      //   return false;
      // }

      let typeidPromises = [];//获取对应菜谱分类信息的 promise对象集合
      typeIdRes.data.forEach(item=>{
        const typePromise = Api.findId(Config.tables.recTypeName,item.recipeTypeId);
        typeidPromises.push(typePromise);
      }) 
      const userTypeNameRes = await Promise.all(typeidPromises);
      const userTypeName = userTypeNameRes.map(item=>{
        return item.data;
      })
      // console.log(userTypeName,'userTypeName')
      // 合并刷新来的数据
      this.setData({
        userTypeName: this.data.userTypeName.concat(userTypeName)
      })

      wx.hideLoading();
    }catch(err){
      console.log(err,'获取分类错误')
    }

  },

  // 3 获取用户关注的菜谱列表
  async _getuserFollow(page){
   try{
    Api._showLoading();

    // 获取当前用户的openid
    const _openid = Storage._getStorage("_openid");
    const followRes = await Api.find(Config.tables.userfollow,{_openid,status:1,examine:1},page,this.data.recipLimit);
    // console.log(followRes,1111)
    // 判断是否还有数据
    if(followRes.data.length < this.data.recipLimit){
      this.setData({
        isload2:false
      })
      Api._showToast({
        title: "到底啦..."
      })
    }
    // 1 获取关注菜谱的详细数据
    let followPromises = [];//存储所有菜谱详情Promise对象
    followRes.data.forEach(item=>{
      let followPromise = Api.find(Config.tables.recName,{_id:item.recipeId});
      followPromises.push(followPromise);
    })

    // 2 获取所有菜谱详情数据
    const userFollowRes = await Promise.all(followPromises);
    
    followRes.data.forEach((item,index)=>{
      item.userFollow = userFollowRes[index].data[0];
    })
    // console.log(followRes,'followRes')
    // 合并刷新来的数据
    this.setData({
      userFollowList: this.data.userFollowList.concat(followRes.data)
    })

    wx.hideLoading();
   }catch(err){
     console.log(err,'关注数据获取失败')
   }
  },

  // 4 管理员 审核用户发布的菜谱
  async _getuserExamine(page){
    try{
      Api._showLoading();
      // 获取 用户没有删除 status 1 and examine 2 未审核的菜谱列表
      const examRes = await Api.find(
        Config.tables.recName, {
          examine:2,
          status: 1
        },
        page,//页码
        this.data.recipLimit, //一页几条数据
        {
          field: "times",
          sort: "desc"
        }
      );
        // 判断是否还有数据
        if(examRes.data.length < this.data.recipLimit){
          this.setData({
            isload3:false
          })
          Api._showToast({
            title: "到底啦..."
          })
        }
      // console.log(examRes.data, 'examRes菜单列表');
      // if (examRes.data.length == 0) {
      //   Api._showToast({
      //     title: "别拉了 没有了..."
      //   })
      //   this.setData({
      //     isload3:false
      //   })
      //   return false;
      // }
      // 合并刷新来的数据
      this.setData({
        examineList: this.data.examineList.concat(examRes.data)
      })
      wx.hideLoading();
    }catch(err){
      wx.hideLoading();
      Api._showToast({title:"暂无数据"});
      console.log(err,'审核列表获取失败')
    }
  },

  // 5 管理员 下线某些菜谱
  async _getAdopt(page){
    try{
      Api._showLoading();
      // 获取 用户没有删除 status 1 and examine 1 审核通过的菜谱列表
      const adopRes = await Api.find(
        Config.tables.recName, {
          examine:1,
          status: 1
        },
        page,//页码
        this.data.recipLimit, //一页几条数据
        {
          field: "times",
          sort: "desc"
        }
      );
        // 判断是否还有数据
        if(adopRes.data.length < this.data.recipLimit){
          this.setData({
            isload4:false
          })
          Api._showToast({
            title: "到底啦..."
          })
        }
      // 合并刷新来的数据
      this.setData({
        adoptList: this.data.adoptList.concat(adopRes.data)
      })
      wx.hideLoading();
    }catch(err){
      wx.hideLoading();
      Api._showToast({title:"暂无数据"});
      console.log(err,'审核通过列表失败')
    }
  },

  // 菜谱发布上线 examine修改成 1
  async _setRelease(e){
    const { id , index } = e.currentTarget.dataset;
    try{
      const showRes = await Api._showModal({content:'确定审核通过吗'});
      if(showRes.confirm){
      const examRes = await Api.updateId(Config.tables.recName,id,{examine:1});
      const upRes = await Api.updateT(Config.tables.userfollow,{recipeId:id},{examine:1});

      this.data.examineList.splice(index,1);
      this.setData({
        examineList:this.data.examineList
      })
    }
    }catch(err){
      console.log(err,'上线发布错误')
    }
  },

  // 用户发布菜谱未通过审核 物理删除数据库中数据
  async _setdel(e){
    const { id , index } = e.currentTarget.dataset;
    try{
      const delRes = await Api._showModal({content:'确定删除该菜谱吗？'});
      if(delRes.confirm){
      const examdelRes = await Api.removeId(Config.tables.recName,id);
      const delRes = await Api.removeT(Config.tables.userfollow,{recipeId:id});
      this.data.examineList.splice(index,1);
      this.setData({
        examineList:this.data.examineList
      })
    }
    }catch(err){
      console.log(err,'菜谱删除错误')
    }
  },

  // 菜谱下线 examine修改成 2
  async _setadopt(e){
    const { id , index } = e.currentTarget.dataset;
    try{
      const showRes = await Api._showModal({content:'确定下线该菜谱吗'});
      if(showRes.confirm){
      const examRes = await Api.updateId(Config.tables.recName,id,{examine:2});
      const upRes = await Api.updateT(Config.tables.userfollow,{recipeId:id},{examine:2});
      this.data.adoptList.splice(index,1);
      this.setData({
        adoptList:this.data.adoptList
      })
    }
    }catch(err){
      console.log(err,'下线发布错误')
    }
  },

  // 监听用户滚动页码   到底部获取新数据 scroll-view机型适配问题
  // _scrolltolower(e) {
  //   if (this.data.isload && this.data.isLogin) {
  //     // 0 菜单页 1 分类页 2 关注页
  //     if (this.data.indexMenu == 0) {
  //       this.data.recipePage++;
  //       // console.log(this.data.recipePage, "page")
  //       this._getuserPbRecipes(this.data.recipePage); //请求下一页数据
  //     } else if (this.data.indexMenu == 1) {

  //     } else if (this.data.indexMenu == 2) {

  //     }
  //   }
  // },

    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.isLogin) {
      // 0 菜单页 1 分类页 2 关注页
      if (this.data.indexMenu == '0' && this.data.isload && this.data.isLogin) {
        this.data.recipePage++;
        // console.log(this.data.recipePage, "page")
        this._getuserPbRecipes(this.data.recipePage); //请求下一页数据
      } else if (this.data.indexMenu == '1' && this.data.isload1 && this.data.isLogin) {
        this.data.typePage++;
        this._getuserPbType(this.data.typePage);
      } else if (this.data.indexMenu == '2' && this.data.isload2 && this.data.isLogin) {
        this.data.followPage++;
        this._getuserFollow(this.data.followPage); //请求下一页数据
      } else if (this.data.indexMenu == '3' && this.data.isload3 && this.data.isLogin && this.data.isAdmin) {
        this.data.examinePage++;
        this._getuserExamine(this.data.examinePage); //请求下一页数据
      } else if (this.data.indexMenu == '4' && this.data.isload4 && this.data.isLogin && this.data.isAdmin) {
        this.data.adoptPage++;
        this._getAdopt(this.data.adoptPage); //请求下一页数据
      }
    }
  },

  // 删除某个菜单
  async _doDeleteRecipe(e) {
    console.log(e, 'del')
    const {
      id,
      index
    } = e.currentTarget.dataset;
    const showRes = await Api._showModal();
    // console.log(showRes, id, index, 2222)
    if (showRes.confirm) {
      const removeStatus = await Api.updateId(Config.tables.recName, id, {
        status: 2
      });
      if (removeStatus.stats.updated > 0) {
        //为了在视图上看到元素已经删除，这里的数据是有好几次请求生成的数据，所以不能调用  _getCurrentUserPbRecipes方法。
        this.data.userPbRecipes.splice(index, 1);
        this.setData({
          userPbRecipes: this.data.userPbRecipes
        })
        Api._showToast({
          title: "删除成功",
          icon: "success"
        })
      } else {
        Api._showToast({
          title: "删除失败"
        })
        return false;
      }
    }
  },

  
  // 取消关注
  async _setFollow(e){
    try{
      // console.log(e.currentTarget.dataset,'取关')
      const {index,id,recipeId} = e.currentTarget.dataset;

      const showRes = await Api._showModal();
      if(showRes.confirm){
        // 1 更新用户关注表中的status状态为 2 标记取关
        const followRes = await Api.updateId(Config.tables.userfollow,id,{status:2});

        // 2 更新对应菜谱的关注量数据 -1
        const recipeRes = await Api.updateId(Config.tables.recName,recipeId,{follows:Api._.inc(-1)});

        this.data.userFollowList.splice(index, 1)
        // 本地删除
        this.setData({
          userFollowList:this.data.userFollowList
        })
      }
      
    }catch(err){
      console.log(err,'取关失败')
    }
  },

  // 根据用户点击菜单 跳转详情页
  _goToRecipeDetail(e){
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}`,
    })
  },


  // 判断是否登录
  async _ckeckIsLogin() {
    try{
      const checkSessionRes = await Api._checkIsLogin();
      // 用户登录状态默认加载菜单数据
      this._getuserPbRecipes(this.data.recipePage);
      // 获取数据
      this.setData({
        isLogin: true,
        userInfo: Storage._getStorage("userInfo"),
        isAdmin: Storage._getStorage("isAdmin"),
        isShow: Storage._getStorage("isShow"),
      });
    } catch(err){
      // console.log("未登录")
      // 清空本地存储
      Storage._clearStorage();
      // 还原数据
      this.setData({
        isLogin: false,
        userInfo: {},
        isAdmin: false,
        isShow:false,
      })
    }
  },

  // 登录功能
  async _doLogin(e) {
    // console.log(e,'获取userInfo');
    // errMsg === "getUserInfo:fail auth deny"
    if (!e.detail.userInfo) {
      Api._showToast({
        title: '别闹亲 先登录',
        icon: 'loading',
        duration: 1500
      })
      return false;
    }
    // 授权登录
    try {
      const loginRes = await Api._login();
      if (!loginRes.code) {
        Api._showToast({
          title: "凭证获取失败"
        });
      }
      // 调用云函数获取用户openid
      const cloudRes = await Api._cloudFunction('rec-login');
      if (!cloudRes.result.openid) {
        Api._showToast({
          title: "凭证获取失败"
        });
      }
      // 获取用户信息和openid
      const userInfo = e.detail.userInfo;
      const _openid = cloudRes.result.openid;
      // 判断是否管理员
      const isAdmin = await Config.getAdmin(_openid);
      // 菜谱添加按钮权限
      const isShow = await Config.getShow();
      // 存储缓存
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('_openid', _openid);
      wx.setStorageSync('isAdmin', isAdmin);
      wx.setStorageSync('isShow', isShow);
      // 缓存信息
      this.setData({
        isLogin: true,
        userInfo,
        isAdmin,
        isShow
      });
      //{ openid:xxxx,userInfo:xxxxxx }
      //第1次登录，要往users集合中添加数据
      //此处的openid，是要在users集合中找数据。没有找到 、add
      const users = await Api.find(Config.tables.usersName, {_openid});
      if (users.data.length > 0) {
        // 调用菜单列表加载
        this._getuserPbRecipes(this.data.recipePage);

        // console.log(users,users.data[0].userInfo,'用户已存在')
        // console.log(userInfo,'e')
        const isEqualRes = Api._isObjectValueEqual(users.data[0].userInfo, userInfo)
        // console.log(isEqualRes,'isEqualRes')
        // 用户存在时 若数据不一致 更新
        if (!isEqualRes) {
          const _id = users.data[0]._id;
          const updateRes = await Api.updateId(Config.tables.usersName, _id, {
            userInfo
          });
          // console.log(updateRes,'updateRes')
          if (updateRes.stats.updated !== 0) {
            Api._showToast({
              title: "信息更新成功",
              icon: "success"
            })
          }
        }
        return;
      }
      // 用户存储 数据库 用户未注册 时添加
      const resultLogin = await Api.add(Config.tables.usersName, {
        userInfo
      });

    } catch (err) {
      Api._showToast({
        title: "授权失败..."
      });
      console.log(err, '登录错误')
    }

  },
  // 管理员功能 添加菜单分类
  _goRecipeTypePage() {
    if (this.data.isAdmin) {
      wx.navigateTo({
        url: '/pages/pbmenutype/pbmenutype',
      })
    }
  },

  // 跳转菜谱发布添加页面 任何用户都可以发布菜谱  分类仅管理员
  _goToPublishRecipe() {
    wx.navigateTo({
      url: '/pages/pbmenu/pbmenu',
    })
  },

  // 跳转菜谱详情页
  _goToRecipeDetail(e){
    const {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}`,
    })
  },

  //跳转用户菜谱分类列表页
  _goToRecipeList(e){
    console.log(e.currentTarget.dataset)
    const { id,typeName } = e.currentTarget.dataset;
    // type 3 代表个人中心跳转 展示用户的菜谱列表
    wx.navigateTo({
      url: `/pages/recipelist/recipelist?id=${id}&typeName=${typeName}&type=3`,
    })
  }

})