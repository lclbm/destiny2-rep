import { DestinyApi } from "./destiny_api.js";

import { gen_login_button, gen_profile } from './components/index.js';

var API = new DestinyApi();

async function fetch_stats() {
  return await API.request('https://127.0.0.1:5000/stats/', { 'method': 'GET' });
}

async function search_player(name) {
  $("#searchAlertPlaceholder button").click();
  var membershipType, membershipId;

  try {
    if (name == "") throw new Error("请输入玩家的ID");
    [membershipType, membershipId] = await API.search_player(name);
    $("#searchAlertPlaceholder").html(`<div class="alert alert-success alert-dismissible fade show" role="alert" style="margin-top:10px">
            <strong>玩家信息：</strong> ${membershipType} ${membershipId} 
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`);
  }
  catch (e) {
    $("#searchAlertPlaceholder").html(`<div class="alert alert-danger alert-dismissible fade show" role="alert" style="margin-top:10px">
        <strong>查询玩家出现错误：</strong> ${e.message} 
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`);
  }
}


window.onload = async function () {

  // 绑定搜索按钮
  $("#search_button").click(async function () {
    var name = $("#search_input").val();
    await search_player(name);
  });

  // 绑定搜索框回车
  $("#search_input").on('keypress', function (e) { if (e.keyCode == 13) { $("#search_button").click(); } });

  // 获取stats数据，如果出现异常则跳过
  try {
    var stats = await fetch_stats();
    for (let key in stats.Response) {
      let v = stats.Response[key];
      $(`#${key}PlaceHolder`).html(v);
    }
  } catch (error) {
    console.error(error);
  }

  if (await gen_profile() !== true) await gen_login_button();

};
