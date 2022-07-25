const HEADERS = {"X-API-Key": ""}

async function request(url, type, data = {}) {
    if (type === "GET") {
        var resp = await fetch(
            url, {
            method: "GET",
            headers: HEADERS
        }
        )
    } else {
        var resp = await fetch(
            url, {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify(data)
        }
        )
    }
    var json = await resp.json()
    if (!resp.ok) {
        throw new Error(json.Message)
    }
    return json
}


async function search_steam_name(steamId) {
    return await request(`https://www.bungie.net/Platform/User/GetMembershipFromHardLinkedCredential/SteamId/${steamId}/`, "GET")
}


async function search_bungie_name(name) {

    var nameReg = /^(.+)#(\d{3,4})$/
    var groups = nameReg.exec(name)

    if (groups) {
        var perfixName = groups[1]
        var nameCode = groups[2]
        var page = 0
        while (true) {
            var resp = await request(`https://www.bungie.net/Platform/User/Search/GlobalName/${page}/`, "POST", { "displayNamePrefix": perfixName })
            for (let membershipData of resp.Response.searchResults) {
                if (membershipData.bungieGlobalDisplayName == perfixName && membershipData.bungieGlobalDisplayNameCode == nameCode) {
                    return membershipData
                }
            }
            if (resp.Response.hasMore) page++
            else {
                throw new Error("所查询玩家ID不存在，请检查ID是否正确")
            }
        }
    } else {
        var resp = await request("https://www.bungie.net/Platform/User/Search/GlobalName/0/", "POST", { "displayNamePrefix": name })
        if (resp.Response.searchResults.length == 0) throw new Error("所查询玩家ID不存在，请检查ID是否正确")
        else if (resp.Response.searchResults.length > 1) throw new Error("有许多玩家重名，请使用完整BungieId进行查询，如：何志武223#5270")
        else if (resp.Response.searchResults.length == 1) return resp.Response.searchResults[0]
    }
}


async function search_player(name) {
    var steamIdReg = /^7656\d{13}$/;
    var steamId = steamIdReg.exec(name);
    try {
        if (steamId) { var res = await search_steam_name(steamId[0]) }
        else { var res = await search_bungie_name(name) }
        console.log(res)
    } catch (e) {
        $("#searchAlertPlaceholder").html(`<div class="alert alert-danger alert-dismissible fade show" role="alert" style="margin-top:10px">
        <strong>查询玩家出现错误：</strong> ${e.message} 
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`)
    }
}


window.onload = function () {
    $("#search_button").click(function () {
        var name = $("#search_input").val();
        search_player(name);
    });
    $("#search_input").on('keypress', function (e) { if (e.keyCode == 13) { $("#search_button").click() } });
}
