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

    var codeReg = /^\?code=(.{32})$/;
    var code = codeReg.exec(window.location.search);
    if (code) {
        let token = await API.fetch_token(code[1]);
        Cookies.set('access_token', token.access_token, { expires: token.expires_in / 3600 });
        Cookies.set('refresh_token', token.refresh_token, { expires: token.refresh_expires_in / 3600 });
    }

    var access_token = Cookies.get('access_token');
    var refresh_token = Cookies.get('refresh_token');
    if (access_token) {
        var res = await API.fetch_membershipdata_for_current_user(access_token);
        console.log(res);
    }
    else if (refresh_token) {
        let token = await API.refresh_token(refresh_token);
        Cookies.set('access_token', token.access_token, { expires: token.expires_in / 3600 / 24 });
        Cookies.set('refresh_token', token.refresh_token, { expires: token.refresh_expires_in / 3600 / 24 });
        access_token = token.access_token;
    }

    $("#search_button").click(function () {
        var name = $("#search_input").val();
        search_player(name);
    });
    $("#search_input").on('keypress', function (e) { if (e.keyCode == 13) { $("#search_button").click(); } });
};
