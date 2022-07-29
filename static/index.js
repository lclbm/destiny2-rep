import { DestinyApi } from "./destiny_api.js";

import { gen_login_button, gen_profile } from './components/index.js';

var API = new DestinyApi();

async function fetch_stats() {
  return await API.request('https://127.0.0.1:5000/stats/');
}


async function add_user(membership_type, membership_id, bungie_membership_id) {
  var data = new FormData();
  data.append('membership_type', membership_type);
  data.append('membership_id', membership_id);
  data.append('bungie_membership_id', bungie_membership_id);
  await API.request('https://127.0.0.1:5000/user/add/',
    {
      method: 'POST',
      body: data,
    });
}

async function search_player(name) {
  $("#searchAlertPlaceholder button").click();
  var membershipType, membershipId;

  try {
    if (name == "") throw new Error("请输入玩家的ID");
    [membershipType, membershipId] = await API.search_player(name);
    await add_user(membershipType, membershipId);
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

$(async function () {
  // 绑定搜索按钮
  $("#search_button").click(async function () {
    var name = $("#search_input").val();
    await search_player(name);
  });

  // 绑定搜索框回车
  $("#search_input").on('keypress', function (e) { if (e.keyCode == 13) { $("#search_button").click(); } });

})

$(async function () {
  // 获取stats数据
  var stats = await fetch_stats();
  for (let key in stats.Response) {
    let v = stats.Response[key];
    $(`#${key}PlaceHolder`).html(v);
  }
})

$(async function () {
  // 视情况生成登录按钮或个人资料
  if (await gen_profile() !== true) await gen_login_button();
})
