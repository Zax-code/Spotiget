var hiddenElement = document.createElement('a');
let client_Id = '4f6caab820c94eb3942a3d754279c1e9';
let client_secret = 'ee23439724ce459d9f01d131877a003a';
google = "https://www.google.com/"
localHost = "http%3A%2F%2F127.0.0.1%3A8080%2F";
let authURL = `https://accounts.spotify.com/authorize?client_id=${client_Id}&response_type=code&redirect_uri=${google}&scope=playlist-read-private%20playlist-read-collaborative&state=34fFs29kd09`;
let authCode = null;
hiddenElement.target = '_blank';
hiddenElement.download = 'Spot.csv';
infos = {};

GetToken = (code, redirect) => {
        let request = new XMLHttpRequest();
        request.open('POST', 'https://accounts.spotify.com/api/token', true);
        request.setRequestHeader('Authorization', 'Basic ' + btoa(`${client_Id}:${client_secret}`));
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                data = JSON.parse(this.response);
                authCode = redirect ? data.refresh_token : authCode;
                Tokeninput.value = data.access_token;
            } else if (request.status == 401) {
                authCode = null;
                FillToken();
            }
        }
        let body = `grant_type=${redirect?"authorization_code":"refresh_token"}&${redirect?"code":"refresh_token"}=${code}${redirect?`&redirect_uri=${google}`:''}`;
        console.log(body);
        request.send(body);
}

FillToken = () => {
    if (authCode) {
        GetToken(authCode, false);
    } else {
        auth = window.open(
            authURL,
            'Login with Spotify',
            'menubar=no,location=no,resizable=no,scrollbars=no,status=no'
        )
        window.spotifyCallback = (payload) => {
            auth.close()
            this.console.log(payload);
        }
        getCode = setInterval(() => {
            if (!auth.closed) {
                code = auth.location.href;
                closeWin = code.includes("code=");
                AccessError = code.includes('error=access_denied')
                code = code.substring(code.indexOf('code=') + "code=".length);
                if (authCode || closeWin) {
                    auth.close();
                    console.log(code);
                    GetToken(code, true);
                }
                if (AccessError) {
                    console.log("Access Error");
                    auth.close();
                }
            } else {
                clearInterval(getCode);
            }
        }, 100);
    }
}


GetInformations = function(track, token) {
    infos = { "popularity": [], "artists": [], "explicit": [], "numéro": [] };
    var request1 = new XMLHttpRequest();
    if(track.includes("playlist")){
        track=track.substring(track.indexOf("playlist")+"playlist".length+1);
        console.log(track)
    }
    request1.open('GET', 'https://api.spotify.com/v1/playlists/' + track);
    request1.setRequestHeader('Authorization', 'Bearer ' + token);

    request1.onload = function() {
        var playlist = JSON.parse(this.response)
        if (request1.status >= 200 && request1.status < 400) {
            playlist.tracks.items.forEach(track => {
                infos['popularity'].push(track.track.popularity);
                infos['artists'].push(track.track.artists.map(t => t.name).join(' , '));
                infos['explicit'].push(track.track.explicit);
                infos['numéro'].push(track.track.track_number);
                trackId = track.track.id;
                var request2 = new XMLHttpRequest()
                request2.open('GET', 'https://api.spotify.com/v1/audio-features?ids=' + trackId)
                request2.setRequestHeader('Authorization', 'Bearer ' + token);
                dontTake = ["analysis_url", "id", "track_href", "type", "uri", "time_signature"]
                request2.onload = function() {
                    var data2 = JSON.parse(this.response)
                    if (request2.status >= 200 && request2.status < 400) {
                        data2.audio_features.forEach(af => {
                            Object.keys(af).forEach(k => {
                                if (!dontTake.includes(k))
                                    if (infos[k])
                                        infos[k].push(af[k]);
                                    else
                                        infos[k] = [af[k]];
                            })
                        });
                    }
                }
                request2.send();         
            });
            setTimeout(()=>{       
                hiddenElement.setAttribute('href', "data: attachment; UTF-8," +(MakeCsv(infos)));
                hiddenElement.click();},500);
        } else {
            popup.style.backgroundColor = "red";
            if (request1.status == 401) {
                popup_title.innerHTML = "Erreur d'authentification (401)";
                popup_message.innerHTML = "Le Token entré est invalide";
            } else {
                popup_title.innerHTML = "Erreur inattendue";
                popup_message.innerHTML = "Une erreur inattendue est survenu, veuillez ressayer plus tard";
            }
        }
    }

    request1.send();
}


MakeCsv = (object) => {
    allKeys = Object.keys(object);
    result = "Place;" + allKeys.join(";") + "\r";
    for (let i = 0; i < object[allKeys[0]].length; i++) {
        result += i + ";";
        allKeys.forEach(k => {
            result += `${object[k][i]}${k!="duration_ms"?';':''}`;
        })
        result += "\r";
    }
    return result;
}

window.onload = () => {
    popup_title = document.getElementById("popup_t");
    popup_message = document.getElementById("popup_m");
    sub = document.getElementById("submit");
    fill = document.getElementById("auto_fill");
    Tokeninput = document.getElementById("TokenIn");
    IdInput = document.getElementById("IdIn");
    popup = document.getElementsByClassName("popup")[0];
    exit = document.getElementById("exit");


    exit.addEventListener("click",function(){
        window.close();
    })
    fill.addEventListener("click", FillToken);
    sub.addEventListener("click", function(event) {
        popup.style.visibility = "visible";
        popup.classList.toggle("show");
        GetInformations(IdInput.value, Tokeninput.value ? Tokeninput.value : "rien");
    });
    popup.onclick = () => {
        popup.style.visibility = "hidden";
        window.getComputedStyle(popup);
        popup.classList.remove("show");
    }
};