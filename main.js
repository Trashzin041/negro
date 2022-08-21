var savedAccs = JSON.parse(localStorage.getItem("generatedAccs"))

if (localStorage.getItem("generatedAccs") === null) {
    localStorage.setItem("generatedAccs", JSON.stringify({ "accounts": [] }))
}

function apiSuccess(data) {
    loadButton(false)
    if (data.success) {

        data.accounts.forEach(account => {
            savedAccs.accounts.push(account)
            insertIntoTables(account)
        });
        $('#outputRemaining').html(`Accounts Left: ${data.accountsleft}`)
    } else {
        console.log(data.reason)
        return alert(`API Error: ${data.reason}`)
    }
    localStorage.setItem("generatedAccs", JSON.stringify(savedAccs))
}

function insertIntoTables(account, historyOnly) {
    if (!historyOnly) {
        let o_row = outputTable.insertRow(1);
        let o_cell1 = o_row.insertCell(0);
        let o_cell2 = o_row.insertCell(1);
        let o_cell3 = o_row.insertCell(2);

        o_cell1.innerHTML = account.username
        o_cell2.innerHTML = account.password
        o_cell3.innerHTML = `${account.username}:${account.password}`
    }

    let h_row = historyTable.insertRow(1);
    let h_cell1 = h_row.insertCell(0);
    let h_cell2 = h_row.insertCell(1);
    let h_cell3 = h_row.insertCell(2);

    h_cell1.innerHTML = account.username
    h_cell2.innerHTML = account.password
    h_cell3.innerHTML = `${account.username}:${account.password}`
    $('#historyTotal').html(`Total: ${savedAccs.accounts.length}`)
}

function gkeyButtonSubmit() {
    if ($('#gkey')[0].readOnly) {
        $('#gkey').prop("readonly", false)
        $('#gkeybtn').html("Save key")
    } else {
        $('#gkey').prop("readonly", true)
        $('#gkeybtn').html("Edit key")
        localStorage.setItem("APIKey", $('#gkey').val())
    }
}

function toggleHistoryOutput() {
    if (!$('#outputDiv')[0].hidden) {
        $('#HOToggle').html("Output")
        $('#outputDiv').prop("hidden", true)
        $('#historyDiv').prop("hidden", false)
    } else {
        $('#HOToggle').html("History")
        $('#outputDiv').prop("hidden", false)
        $('#historyDiv').prop("hidden", true)
    }
}

function loadButton(toggle) {
    if (toggle) {
        $('#submitBtn')[0].value = "Loading..."
        $('#submitBtn').prop("disabled", true)
    } else {
        $('#submitBtn')[0].value = "Generate"
        $('#submitBtn').prop("disabled", false)
    }
}


$(document).ready(function () {
    var outputTable = $('#outputTable')[0]
    var historyTable = $('#historyTable')[0]

    if (savedAccs.accounts.length >= 1) {
        savedAccs.accounts.forEach(account => {
            insertIntoTables(account, true)
        });
    }

    $('#gkey').val(localStorage.getItem("APIKey"))
    $('form').on('submit', function (e) {
        e.preventDefault();
        loadButton(true)
        let formData = Array.from(new FormData(e.target))

        if (!$('#gkey')[0].readOnly) {
            loadButton(false)
            return alert("Please save your API key")
        }
        
        if (formData[0][1] === "") {
            loadButton(false)
            return alert("Please provide an API key")
        }

        $.ajax({
            type: "POST",
            url: "https://accounts.robloxalts.info/api/public/demand/generate",
            data: `{"apikey":"${formData[0][1]}","amount":${parseInt(formData[1][1])}}`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: apiSuccess,
            error: function (err) {
                console.log(err)
                loadButton(false)
                if (err.responseJSON?.reason) {
                    alert(`API Error: ${err.responseJSON.reason} \n\nHTTP: ${err.status} (${err.statusText})`)
                } else if (err.status === 404) {
                    return alert("The server is offline")
                } else if (err.readyState === 4) {
                    return alert(`HTTP: ${err.status} (${err.statusText})`)
                } else {
                    return alert("An unknown error occured")
                }
            }
        });
    });
});

