function parseTime(ele) {
    var hour, second, micro;
    var begin = ele.begin.match(/\d+/g).map(function (t) { return t = parseInt(t) });
    if (ele.end != undefined) {
        var end = ele.end.match(/\d+/g).map(function (t) { return parseInt(t); });
        hour = end[0] - begin[0];
        second = end[1] - begin[1];
        micro = end[2] - begin[2];
        ele.beginTime = (begin[0] * 60e3) + (begin[1] * 1e3) + (begin[2] * 10);
        ele.endTime = (end[0] * 60e3) + (end[1] * 1e3) + (end[2] * 10);
        ele.time = (hour * 60e3) + (second * 1e3) + (micro * 10);
    }
}

function parseLrc(result) {
    var data = [];
    result = result.split('\n')
    result.forEach(function (element) {
        var parse = element.match(/(\[[\d:\.]+\])?(.+)/);
        if (parse === null) return;
        var line = {};
        if (parse[1] != undefined) {
            line.begin = parse[1];
            line.txt = parse[2];
        } else {
            line.begin = parse[2];
            line.txt = '';
        }
        data.length ? data[data.length - 1].end = line.begin : '';
        data.push(line);
    }, this);
    data.map(function (ele) {
        parseTime(ele);
    });
    return data;
}


function createAudio(id,src){
    var audio =document.createElement('audio');
    audio.id = id;
    audio.src = src;
    return audio;
}
function bindAudioEvent(target,list){
    var length = list.length;
    var step = 0;
    target.addEventListener('timeupdate', function(e){
        for(var i=step;i<length;i++){
            if(list[i].data.beginTime < e.timeStamp + 100){
                step ++;
                list[i].ele.className = 'current';
                if(list[i-1]){
                    list[i-1].ele.className = 'end';
                    list[i-1].ele.innerHTML = list[i-1].ele.innerHTML.replace(/transition[^?;]+;/g,function(ret){return 'off~' + ret})
                }
            }
        }
    })
}

function renderList(options) {
    if(this instanceof renderList){
        return new renderList(arguments);
    }
    var ele,data,target,ul,list=[],uid=0;
    ele = options.ele;
    data = options.data;
    target = document.querySelector(ele);
    data = parseLrc(data);
    this.target = target;
    this.audio = createAudio('audio',options.audio);
    ul = document.createDocumentFragment();

    data.forEach(function(item,index){
        var li = document.createElement('li');
        var line = document.createElement('a');
        var read = document.createElement('span');
        if(index === 0){
            li.className = li.className+' title';
        }
        li.id = 'line' + uid++;
        line.className = 'line';
        line.innerHTML = item.txt;
        read.innerHTML = item.txt;
        read.className = 'read';
        read.style.transition = 'width ' + item.time + 'ms';
        line.appendChild(read);
        li.appendChild(line);
        ul.appendChild(li);
        list.push({
            data : item,
            ele: li
        })
    });
    bindAudioEvent(this.audio,list);

    target.appendChild(this.audio);
    target.appendChild(ul);
    return this;
}


window.onload = function () {
    fetch('./lrc/cbg.lrc').then(function (res) {
        return res.text();
    }).then(function (res) {
        renderList({
           ele: '#lyrics',
           data: res,
           audio:'./music/cbg.mp3'
        }).audio.play();
    });
}