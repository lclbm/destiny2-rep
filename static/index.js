import { DestinyApi } from "./destiny_api.js";
import Cookies from './modules/js.cookie.mjs';

var API = new DestinyApi();

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
        // location.assign(`/player/${membershipType}/${membershipId}`);
    }
    catch (e) {
        $("#searchAlertPlaceholder").html(`<div class="alert alert-danger alert-dismissible fade show" role="alert" style="margin-top:10px">
        <strong>查询玩家出现错误：</strong> ${e.message} 
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`);
    }
}


window.onload = async function () {

    $("#search_button").click(function () {
        var name = $("#search_input").val();
        search_player(name);
    });

    $("#search_input").on('keypress', function (e) { if (e.keyCode == 13) { $("#search_button").click(); } });

    
    var codeReg = /^\?code=(.{32})$/;
    var code = codeReg.exec(window.location.search);
    if (code) {
        let token = await API.fetch_token(code[1]);
        Cookies.set('access_token', token.access_token, { expires: token.expires_in / 3600 });
        Cookies.set('refresh_token', token.refresh_token, { expires: token.refresh_expires_in / 3600 });
        history.replaceState(null, null, "/");
    }

    var access_token = Cookies.get('access_token');
    var refresh_token = Cookies.get('refresh_token');
    var membershipData;

    try {
        if (refresh_token) {
            // 如果refresh_token存在且未过期，access_token已过期，则刷新access_token
            if (!access_token) {
                let token = await API.refresh_token(refresh_token);
                Cookies.set('access_token', token.access_token, { expires: token.expires_in / 3600 });
                Cookies.set('refresh_token', token.refresh_token, { expires: token.refresh_expires_in / 3600 });
            }
            access_token = Cookies.get('access_token');
            membershipData = await API.fetch_membershipdata_for_current_user(access_token);
            console.log(membershipData);

        }
    } catch (error) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
    }

    if (membershipData) {
        // $("#loginPlaceHolder").html(`<a class="btn btn-outline-primary" href="https://www.bungie.net/zh-chs/oauth/authorize?client_id=40835&response_type=code" role="button"
        // style="width: 8rem;font-size:1.2rem">登录</a>`);
    } else {
        $("#loginPlaceHolder").html(`<a class="btn btn-outline-primary" href="https://www.bungie.net/zh-chs/oauth/authorize?client_id=40835&response_type=code" role="button"
        style="width: 8rem;font-size:1.2rem">登录</a>`);
    }



};
