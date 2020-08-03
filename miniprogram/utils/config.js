// 配置文件
import api from './api';

// 配置数据名
const tables = {
  recName:"rec-recipes",//菜谱内容表|集合
  recTypeName:"rec-recipeType",//菜谱分类表|集合
  usersName:"rec-users",//注册用户表|集合
  userfollow:"rec-follow",//用户关注量表|集合
  userPbType:'rec-userPbType',//用户发布过菜谱的分类详细|集合
  userAdmin:'rec-userAdmin',//用户管理员 / 添加菜谱 权限表
}

// 管理员权限 列表openid
const getAdmin = async(_openid)=>{
  try{
    const admin = await api.find(tables.userAdmin,{_openid});
    if(_openid == admin.data[0]._openid){
      return true;
    }else{
      return false;
    }
  }catch(err){
    return false;
  }
  // const index = admin.data.findIndex(item=>{
  //   return item._openid === openid;
  // })
  // return index == -1 ? false : true;
}

// 配置 个人中心页面的菜谱添加按钮权限 自行添加 status 1
const getShow = async()=>{
  try{
    const showRes = await api.find(tables.userAdmin,{status:1});
    // console.log(showRes,'true')
    if(showRes.data.length == 1){
      return true;
    }else{
      return false;
    }
  }catch(err){
    console.log(err,'按钮权限失败')
    return false;
  }
}




export default {
  tables,
  getAdmin,
  getShow
}