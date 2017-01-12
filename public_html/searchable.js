// Bookmarklet
//javascript:!function(){void 0==window.getSearchableTable?(arr=new Uint8Array(5),window.crypto.getRandomValues(arr),s=document.createElement("script"),s.src="https://raw.githubusercontent.com/rame0/Ya-Webmaster-tools/master/public_html/searchable.js?"+Array.from(arr).join(""),document.head.appendChild(s)):window.getSearchableTable()}();


try {

    window.isSearchableRunning = false;
    window.searchableRESULT = [];
    function getSearchableTable() {
        if (window.isSearchableRunning === false) {
            console.log("START");
            $(".searchableRESULTtable").remove();
            window.isSearchableRunning = true;
            parseSearchableData(1);
            return;
        } else {
            alert("Previous parsing not done yet. Be patient.");
        }
    }

    function parseSearchableData(page) {
        var post = {
            params: {
                balancerRequestId: window.bh.lib.global.balancerRequestId,
                parentUrl: String(window.location),
                hostId: window.bh.lib.global.webmasterHostId,
                page: page,
                samplesType: "event",
                perpageCount: 20,
            },
            crc: window.BEM.blocks["i-global"].param("crc")
        }
        console.log("Parsing page " + page + "...");
        $.ajax({
            type: "POST",
            url: "/gate/searchable-samples/event-samples-list/",
            data: post,
            success: function (data) {
                window.searchableRESULT = window.searchableRESULT.concat(data.response.tableData.data);
                if (data.response.tableData.pager.page < Math.ceil(data.response.tableData.pager.totalCount / data.response.tableData.pager.perpageCount)) {
                    parseSearchableData(data.response.tableData.pager.page + 1);
                } else {
                    parseSearchableDataDone();
                }
            }
        });
    }
    function parseSearchableDataDone() {
        console.log("Building results...");

        var table = $("<table/>").addClass("searchableRESULTtable content__chunk").html(
                "<tr><td>URL</td><td>Статус</td><td>Обновлен</td><td>Посещен</td><td>Title</td>" +
                // Если есть объект statusInfo можем вывести доп. данные
                "<td>Дата добавления</td><td>HTTP-код</td><td>Главный регион<br/>(Регион главной?)</td><td>Регион</td>" +
                // Подробности о статусе
                "<td>Статус</td><td>Описание статуса</td></tr>"
                );
        for (var key in window.searchableRESULT) {
            var tr = $("<tr/>");
            tr.append($("<td/>").html(window.searchableRESULT[key].url));
            tr.append($("<td/>").html(window.searchableRESULT[key].eventType === "NEW" ? "Добавлен" : "Удален"));
            tr.append($("<td/>").html(window.searchableRESULT[key].searchBaseDate));
            tr.append($("<td/>").html(window.searchableRESULT[key].lastAccess));
            tr.append($("<td/>").html(window.searchableRESULT[key].title === "" ? "! ПУСТОЙ TITLE !" : window.searchableRESULT[key].title));

            // Если есть объект statusInfo можем вывести доп. данные
            if (window.searchableRESULT[key].statusInfo !== undefined) {
                tr.append($("<td/>").html(bh.lib.moment(window.searchableRESULT[key].statusInfo.addTime).format("L")));
                tr.append($("<td/>").html(window.searchableRESULT[key].statusInfo.httpCode));
                tr.append($("<td/>").html(window.searchableRESULT[key].statusInfo.mainRegion));
                tr.append($("<td/>").html(window.searchableRESULT[key].statusInfo.region));
                var data = bh.utils.extend({}, window.searchableRESULT[key].statusInfo, {
                    encodedOriginalUrl: encodeURIComponent(bh.lib.webmasterHost(bh.lib.global.webmasterHostId).getDisplayName(!0) +
                            bh.lib.decoder.decodeURIComponent(window.searchableRESULT[key].path)),
                    hostId: bh.lib.global.webmasterHostId,
                    lastAccess: bh.lib.moment(window.searchableRESULT[key].lastAccess).format("L")
                })
                tr.append($("<td/>").html(bh.lib.i18n("http-code-status2", window.searchableRESULT[key].statusInfo.status + "-title", data)));
                tr.append($("<td/>").html(bh.lib.i18n("http-code-status2", window.searchableRESULT[key].statusInfo.status + "-description", data)));
            }

            table.append(tr);
        }

        $("body").append(table);

        window.isSearchableRunning = false;
        window.searchableRESULT = [];
        console.log("DONE");
    }
    getSearchableTable();

} catch (e) {
    console.log(e);
    alert("Something went wrong. Contact developer: https://www.fb.com/rame0");
}