import { HEADERS, X_API_KEY, CLIENT_ID, CLIENT_SECRET } from "./config.js";


class Token {
    constructor(access_token, refresh_token, expires_in, membership_id, refresh_expires_in, token_type) {
        this.expires_in = expires_in;
        this.refresh_expires_in = refresh_expires_in;

        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.membership_id = membership_id;
        this.token_type = token_type;
    }
}


export class DestinyApi {

    async request(url, init = {}) {

        var resp = await fetch(
            url, init
        );
        var json = await resp.json();
        if (!resp.ok) {
            throw new Error(json.Message);
        }
        return json;
    }

    async search_steam_name(steamId) {
        return await this.request(`https://www.bungie.net/Platform/User/GetMembershipFromHardLinkedCredential/SteamId/${steamId}/`, {
            method: "GET",
            headers: HEADERS
        });
    }



    async search_bungie_name(name) {
        var nameReg = /^(.+)#(\d{3,4})$/;
        var groups = nameReg.exec(name);

        if (groups) {
            var perfixName = groups[1];
            var nameCode = groups[2];
            var page = 0;
            while (true) {
                let resp = await this.request(`https://www.bungie.net/Platform/User/Search/GlobalName/${page}/`,
                    { method: "POST", body: (JSON.stringify({ "displayNamePrefix": perfixName })), headers: HEADERS });
                for (let membershipData of resp.Response.searchResults) {
                    if (membershipData.bungieGlobalDisplayName == perfixName && membershipData.bungieGlobalDisplayNameCode == nameCode) {
                        return membershipData;
                    }
                }
                if (resp.Response.hasMore) page++;
                else {
                    throw new Error("所查询玩家ID不存在，请检查ID是否正确");
                }
            }
        } else {
            let resp = await this.request("https://www.bungie.net/Platform/User/Search/GlobalName/0/",
                { method: "POST", body: (JSON.stringify({ "displayNamePrefix": name })), headers: HEADERS });
            if (resp.Response.searchResults.length == 0) throw new Error("所查询玩家ID不存在，请检查ID是否正确");
            else if (resp.Response.searchResults.length > 1) throw new Error("有许多玩家重名，请使用完整BungieId进行查询（如：何志武223#5270）");
            else if (resp.Response.searchResults.length == 1) return resp.Response.searchResults[0];
        }
    }

    async search_player(name) {
        var steamIdReg = /^7656\d{13}$/;
        var steamId = steamIdReg.exec(name);

        var membershipType, membershipId;
        if (steamId) {
            let res = await this.search_steam_name(steamId[0]);
            membershipType = res.Response.membershipType;
            membershipId = res.Response.membershipId;
        }
        else {
            let res = await this.search_bungie_name(name);
            membershipType = res.destinyMemberships[0].membershipType;
            membershipId = res.destinyMemberships[0].membershipId;
        }
        return [membershipType, membershipId];
    }

    async fetch_token(code) {
        var resp = await this.request(`https://www.bungie.net/platform/app/oauth/token/`, {
            body: [
                "grant_type=authorization_code",
                `code=${code}`,
                `client_id=${CLIENT_ID}`,
                `client_secret=${CLIENT_SECRET}`
            ].join("&"),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
        });
        return new Token(resp.access_token, resp.refresh_token, resp.expires_in, resp.membership_id, resp.refresh_expires_in, resp.token_type);
    }

    async refresh_token(refresh_token) {
        var resp = await this.request(`https://www.bungie.net/platform/app/oauth/token/`, {
            body: [
                "grant_type=refresh_token",
                `refresh_token=${refresh_token}`,
                `client_id=${CLIENT_ID}`,
                `client_secret=${CLIENT_SECRET}`
            ].join("&"),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
        });
        return new Token(resp.access_token, resp.refresh_token, resp.expires_in, resp.membership_id, resp.refresh_expires_in, resp.token_type);
    }

    async fetch_membershipdata_for_current_user(access_token) {
        var resp = await this.request(`https://www.bungie.net/platform/User/GetMembershipsForCurrentUser/`, {
            headers: {
                "X-API-Key": X_API_KEY,
                "Authorization": `Bearer ${access_token}`
            },
            method: "GET"
        });
        return resp;
    }


}