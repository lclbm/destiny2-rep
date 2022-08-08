import { DestinyApi } from "./destiny_api.js";

import { gen_login_button, gen_profile } from './components/header.js';

var API = new DestinyApi();
var membership_type;
var membership_id;
var membership_data;


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
    window.location.href = `./user.html?membership_type=${membershipType}&membership_id=${membershipId}`;
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

});

$(async function () {
  // 获取stats数据
  var stats = await fetch_stats();
  for (let key in stats.Response) {
    let v = stats.Response[key];
    $(`#${key}PlaceHolder`).html(v);
  }
});

$(async function () {
  // 视情况生成登录按钮或个人资料
  if (await gen_profile() !== true) await gen_login_button();
});

$(async function () {
  // 根据params获取玩家信息
  var search = window.location.search;
  var reg = /^\?membership_type=(\d)&membership_id=(\d{19})$/;
  var groups = search.match(reg);


  // 匹配成功，获取玩家的数据
  if (groups) {
    membership_type = groups[1];
    membership_id = groups[2];
    membership_data = await API.fetch_membershipdata_by_id(membership_type, membership_id);
    console.log(membership_data);
    $('#profile-box #avatr img').attr('src', `https://www.bungie.net${membership_data.Response.bungieNetUser.profilePicturePath}`);
    $("#profile-box #user-name").html(membership_data.Response.bungieNetUser.displayName);
    var logo_html = '';
    for (let membership of membership_data.Response.destinyMemberships) {
      let iconPath = membership.iconPath;
      logo_html+=`<div class="col-auto">
      <img src="https://www.bungie.net${iconPath}">
    </div>`;
    }
    $("#profile-box #logo").html(logo_html);
  }

  // 输入的不是正确的membership_type或membership_id
  else {

    var myModal = new bootstrap.Modal($('#myModal'));

    $("#myModal").on('hidden.bs.modal', function (event) {
      window.location.href = "./index.html";
    });

    myModal.show();
  }

});
