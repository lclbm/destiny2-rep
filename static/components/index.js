import { DestinyApi } from "../destiny_api.js";
import { CLIENT_ID } from '../config.js';
import Cookies from '../modules/js.cookie.mjs';


var API = new DestinyApi();

const AUTHORIZE_URL = `https://www.bungie.net/zh-chs/oauth/authorize?client_id=${CLIENT_ID}&response_type=code`;


export async function gen_profile() {

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

        } else return;

    } catch (error) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        return;
    }


    if (membershipData) {
        $("#loginPlaceHolder").html(`<div class="row">
            <div class="col-auto">
              <img src="https://www.bungie.net/${membershipData.Response.bungieNetUser.profilePicturePath}" alt="avatar" style="width:60;height:60;">
            </div>
            <div class="col">
              <div class="row" style="font-weight:600;">
              ${membershipData.Response.bungieNetUser.uniqueName}</div>
              <div class="row buttons">
                <div class="col-auto">
                  <button id="profile-button" type="button" class="btn"><i class="bi bi-person"></i></button>
                </div>
                <div class="col-auto">
                  <button id="logout-button" type="button" class="btn"><i class="bi bi-box-arrow-right"></i></button>
                </div>
              </div>
            </div>
          </div>`);

        $("#logout-button").click(async function () {
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            await gen_login_button();
        });
        
        return true
    }
}

export async function gen_login_button() {
    $("#loginPlaceHolder").html(`<a class="btn btn-outline-primary" id="login-button" role="button"
        style="width: 8rem;font-size:1.2rem">登录</a>`);
    $("#login-button").click(function () {
        localStorage.setItem('tabbed', true);
        window.open(AUTHORIZE_URL);
        window.addEventListener('storage', async function (e) {
            if (localStorage.getItem('tabbed') && localStorage.getItem('code')) {
                let code = localStorage.getItem('code');
                let token = await API.fetch_token(code);
                Cookies.set('access_token', token.access_token, { expires: token.expires_in / 3600 });
                Cookies.set('refresh_token', token.refresh_token, { expires: token.refresh_expires_in / 3600 });
                await gen_profile();
                localStorage.removeItem('tabbed');
                localStorage.removeItem('token');
            }
        });
    });
}
