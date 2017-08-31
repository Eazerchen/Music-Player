function toggleClass(ElemObj, className) {
  for(var i=1; i<arguments.length; i++) {
    if(typeof arguments[i]==='string') {
      arguments[0].classList.toggle(arguments[i])
    }
  }
}
//格式化歌曲时间
function formateDuration(t) {
  var tmpS = parseInt(t % 60)
  var tmpM = parseInt(t / 60)
  return (tmpM < 10 ? '0' + tmpM : tmpM ) + ' : ' + 
  (tmpS < 10 ? '0' + tmpS : tmpS)
}


function Music() {
  this.init()
}

Music.prototype.renderMusic = function(num) {
  var _this = this

  for(var i=1; i<=num; i++) {
    this.songsList[i].querySelector('td:first-child').innerText = this.songsInfoArrays[i-1].title
    this.songsList[i].querySelector('td:nth-child(3)').innerText = this.songsInfoArrays[i-1].artist
    this.songsList[i].querySelector('td:last-child').innerText = formateDuration(this.songsInfoArrays[i-1].duration)

    //绑定歌曲列表播放按钮的播放事件
    this.songsList[i].querySelector('.play-or-pause').addEventListener('click', (function(i){
      return function() {
        var playOrPauseBtn = document.querySelector('.controls .play-or-pause')
        _this.songsList[_this.musicIndex+1].classList.remove('playing')
        //update musicIndex, keep it up with i
        _this.musicIndex = i - 1
        _this.songsList[_this.musicIndex+1].classList.add('playing')
        _this.renderCurrentSongInfo()
        if(_this.lastPlayed!=this) {
          _this.music.src = _this.songsInfoArrays[_this.musicIndex].url
          _this.playMusic()
          if(_this.lastPlayed.classList.contains('icon-pause')) {
            toggleClass(_this.lastPlayed, 'icon-pause', 'icon-play')
          } else {
            //update the button state
            toggleClass(playOrPauseBtn, 'icon-pause1', 'icon-play1')
          }
          _this.lastPlayed = this
        } else {
          if(_this.lastPlayed.classList.contains('icon-play')) {
            _this.playMusic()
          } else {
            _this.music.pause()
          }
          toggleClass(playOrPauseBtn, 'icon-pause1', 'icon-play1')       
        }
        toggleClass(this, 'icon-pause', 'icon-play')
      }     
    })(i))
  }
}

Music.prototype.initPlay = function() {
  var _this = this
  this.music = new Audio(this.songsInfoArrays[this.musicIndex].url)
  this.changeModeBiding()
  this.playMusic()
  this.songsList[this.musicIndex+1].classList.add('playing')
  for(var i=0; i<this.songsClasses.length; i++) {
    this.songsClasses[i].addEventListener('click', function() {
      document.querySelector('#'+_this.currentChannelId).classList.remove('playing')
      _this.currentChannelId = this.getAttribute('id')
      this.classList.add('playing')
      _this.loadMusicInfoAndPlay(_this.currentChannelId)
      for(var j=1; j<=_this.songsInfoArrays.length; j++) {
        _this.songsList[j].querySelector('td:first-child').innerText = _this.songsInfoArrays[j-1].title
        _this.songsList[j].querySelector('td:nth-child(3)').innerText = _this.songsInfoArrays[j-1].artist
        _this.songsList[j].querySelector('td:last-child').innerText = formateDuration(_this.songsInfoArrays[j-1].duration)
      }
      _this.playNextMusic(_this.playModes[_this.playModes[0]])
      _this.renderCurrentSongInfo()
    })
  }
  this.timeUpdateBinding()
  this.renderCurrentSongInfo()
  this.playControlBinding()
  this.likeItBinding()
  this.downLoadBinding()
  this.volumeControlBinding()
  this.musicPlayBinding()
  this.lastPlayed = this.songsList[1].querySelector('.play-or-pause')
  toggleClass(_this.lastPlayed, 'icon-pause', 'icon-play')
}


//正在播放事件、播放结束事件
Music.prototype.musicPlayBinding = function() {
  var _this = this
  var imgElmt = document.querySelector('.player-image img')
  this.music.addEventListener('playing', function() {
    clearInterval(tmpC)
    var tmpC = setInterval(function(){
    _this.updateCurrentTime()
    _this.updateProgress()
    _this.updateLyric()
    }, 1000)
  })
  this.music.addEventListener('ended', function() {
    if(_this.playModes[_this.playModes[0]]==_this.playModes[3]) {
      _this.playMusic()      
    } else {
      _this.playNextMusic(_this.playModes[_this.playModes[0]])      
    }
  })
  this.music.addEventListener('pause', function() {
    imgElmt.classList.add('stop-rotate')
  })
  this.music.addEventListener('play', function() {
    imgElmt.classList.remove('stop-rotate')
  })
}

//adjust the volume
Music.prototype.volumeControlBinding = function() {
  var _this = this
  var lastVolume = this.music.volume = .5 //初始化音量为0.5
  var volumeBtn = document.querySelector('.volume-button')
  var volumeBar = document.querySelector('.volume-bar')  
  var currentVolume = document.querySelector('.current-volume')
 // var progressDot = document.querySelector('.progress-dot')  
  //图标改变声音
  volumeBtn.addEventListener('click', function() {
    if(_this.music.volume) {
      _this.music.volume =0
    } else {
      _this.music.volume = lastVolume
    }
  })
  //音量变动条改变声音
  volumeBar.addEventListener('click', function(e) {
    var W = parseInt(getComputedStyle(volumeBar).width)
    currentVolume.style.width = e.offsetX + 'px'
    lastVolume = _this.music.volume =  parseInt(getComputedStyle(currentVolume).width) / W
  })
  //将音量条变动绑定到声音改变事件
  this.music.addEventListener('volumechange', function(){
    if(this.volume===0) {
      volumeBtn.classList.remove('icon-volume')
      volumeBtn.classList.add('icon-muted')
    } else {
      volumeBtn.classList.add('icon-volume')
      volumeBtn.classList.remove('icon-muted')      
    }
  })
}

Music.prototype.playMusic = function() {
  if(this.music) {
    this.music.play()
  }
  this.loadLyric(this.currentChannelId)
}

//播放下一曲
Music.prototype.playNextMusic = function(playMode) {
  this.songsList[this.musicIndex+1].classList.remove('playing')
  if(playMode==this.playModes[1]||playMode==this.playModes[3]) {
    this.musicIndex++
    this.musicIndex %= this.songsInfoArrays.length
  } else {
    this.musicIndex = Math.floor(Math.random() * this.songsInfoArrays.length)
  }
  this.simulateClick(this.musicIndex+1)
}

//播放上一曲
Music.prototype.playFormerMusic = function(playMode) {
  this.songsList[this.musicIndex+1].classList.remove('playing')
  if(playMode==this.playModes[1]||playMode==this.playModes[3]) {
    this.musicIndex--
    this.musicIndex = (this.musicIndex + this.songsInfoArrays.length) % this.songsInfoArrays.length
  } else {
    this.musicIndex = Math.floor(Math.random() * this.songsInfoArrays.length)
  }
  this.simulateClick(this.musicIndex+1)
}

Music.prototype.playControlBinding = function() {
  var _this = this
  var playNextBtn = document.querySelector('.controls .icon-play-forward')
  var playFormerBtn = document.querySelector('.controls .icon-rewind')
  var playOrPauseBtn = document.querySelector('.controls .play-or-pause')
  var durationBar = document.querySelector('.duration-bar')
  //下一曲、暂停、上一曲
  playNextBtn.addEventListener('click', function() {
    _this.playNextMusic(_this.playModes[_this.playModes[0]])
  })
  playFormerBtn.addEventListener('click', function() {
    _this.playFormerMusic(_this.playModes[_this.playModes[0]])
  })
  playOrPauseBtn.addEventListener('click', function() {
    _this.simulateClick(_this.musicIndex+1)
  })
  //点击进度条更新
  durationBar.addEventListener('click', function(e){
    var p = e.offsetX/parseInt(getComputedStyle(this).width)
    _this.music.currentTime = p * _this.music.duration
    _this.updateCurrentTime()
    _this.updateProgress()
  })
}

//点击喜欢
Music.prototype.likeItBinding = function() {
  var likeBtn = document.querySelector('.like')
  likeBtn.addEventListener('click', function() {
    toggleClass(this, 'icon-like', 'icon-liked')
  })
}
//点击播放模式图标切换
Music.prototype.changeModeBiding = function() {
  var _this = this
  var changeModeBtn = document.querySelector('.play-mode')
  changeModeBtn.addEventListener('click', function() {
    toggleClass(this, _this.playModes[_this.playModes[0]++])
    if(_this.playModes[0]>3) {
      _this.playModes[0]-=3
    }
    toggleClass(this, _this.playModes[_this.playModes[0]])
  })
}
//模拟歌曲列表的点击事件
Music.prototype.simulateClick = function(index) {
  var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true,
  })
  this.songsList[index].querySelector('.play-or-pause').dispatchEvent(event)
}
//渲染当前播放歌曲的信息
Music.prototype.renderCurrentSongInfo = function() {
  var songName = document.querySelectorAll('.song-name')
  var durationSpan = document.querySelector('.duration')
  var playerName = document.querySelectorAll('.player-name')
  var playerImg = document.querySelector('.player-image img')
  for(var i=0; i<songName.length; i++) {
    songName[i].innerText = this.songsInfoArrays[this.musicIndex].title
  }
  for(var i=0; i<playerName.length; i++) {
    playerName[i].innerText = this.songsInfoArrays[this.musicIndex].artist
  }
  durationSpan.innerText = this.songsList[this.musicIndex+1].querySelector('td:last-child').innerText
  playerImg.setAttribute('src', this.songsInfoArrays[this.musicIndex].picture)
}

//更新当前播放时间
Music.prototype.updateCurrentTime = function() {
  var _this = this
  var tmpSeconds = parseInt(_this.music.currentTime % 60);
  var tmpMinutes = parseInt(_this.music.currentTime / 60);
  var secondsSpan = document.querySelector('.seconds')
  var minutesSpan = document.querySelector('.minutes')
  secondsSpan.innerText = tmpSeconds < 10 ? '0' + tmpSeconds : tmpSeconds
  minutesSpan.innerText = tmpMinutes < 10 ? '0' + tmpMinutes : tmpMinutes
}

// updateProgress
Music.prototype.updateProgress = function() {
  var radio = this.music.currentTime / this.music.duration
  var durationBar = document.querySelector('.duration-bar')
  var progressBar = document.querySelector('.progress-bar')
  var durationBarWidth = parseInt(getComputedStyle(durationBar).width)
  var pBWidth = radio * durationBarWidth
  progressBar.style.width = pBWidth + 'px'
}

//处理歌曲分类的ajax数据
Music.prototype.handleClass = function(jsonStr) {
  var _this = this
  this.songsClassObj = JSON.parse(jsonStr)
  for(var i=0; i<this.songsClasses.length; i++) {
    this.songsClasses[i].innerText = this.songsClassObj.channels[i].name
    this.songsClasses[i].setAttribute('id', this.songsClassObj.channels[i].channel_id);
  }
}
Music.prototype.loadMusicInfoAndPlay = function(channleId) {
  var _this = this
  this.songsInfoObjs
  if(!this.songsInfoObjs) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
      if(xhr.readyState===4) {
        if((xhr.status>=200 && xhr.status < 300) || xhr.status == 304) {
          _this.songsInfoObjs = JSON.parse(xhr.responseText)
          _this.songsInfoArrays = _this.songsInfoObjs[channleId]
          _this.renderMusic(_this.songNum)
          _this.initPlay()
        }
        else {
          console.log('sth wrong')
        }
      }
    }
    xhr.open('get', './script/songsOfEachClass.json', true)
    xhr.send(null)
  } else {
    _this.songsInfoArrays = _this.songsInfoObjs[channleId]
  }

}

Music.prototype.init = function() {
  this.songsClasses = document.querySelectorAll('.songs-classes>li')
  this.songsList = document.querySelectorAll('.songs-list tr')
  this.classXhr = new XMLHttpRequest()
  this.songNum = 10
  this.music
  this.lastPlayed
  this.songsInfoArrays = []
  this.num = 0 
  this.musicIndex = 0
  this.lastMusicIndex = this.musicIndex
  this.playModes = [1, 'icon-play-in-order', 'icon-play-random', 'icon-single-cycle', ]//1代表为当前播放模式，取值范围1、2、3
  this.currentChannelId
  
  var _this = this
  _this.classXhr.onreadystatechange = function() {
    if(_this.classXhr.readyState===4) {
      if((_this.classXhr.status>=200 && _this.classXhr.status < 300) || _this.classXhr.status == 304) {
        _this.handleClass(_this.classXhr.responseText)
        _this.currentChannelId = _this.songsClasses[0].getAttribute('id')
        document.querySelector('#'+ _this.currentChannelId).classList.add('playing')
        _this.loadMusicInfoAndPlay(_this.currentChannelId)
      } else {
        alert('Request was unsuccessful: ' + classXhr.status)
      }
    }
  }
  this.classXhr.open('get', './script/songClass.json', true)
  this.classXhr.send(null)
}

Music.prototype.loadLyric = function(channleId) {
  var _this = this
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function() {
    if(xhr.readyState===4) {
      if(((xhr.status>=200 && xhr.status < 300) || xhr.status == 304)) {
        _this.appendLyric(_this.handleLyric(xhr.responseText))
      } else {
        console.log('sth wrong')
      }
    }
  }
  xhr.open('get', './lrc/' + this.songsInfoArrays[this.musicIndex].title + '.lrc', true)
  xhr.send(null)
}

Music.prototype.handleLyric = function(lyric) {
  var lyricLineArray = lyric.split('\n')
  var timeStampPattern = /\[\d{2}:\d{2}.\d{2}\]/g
  var time
  var text
  var tmpT
  var tmpS
  var html = ''
  var objArr = []
  for(var i=0, l=lyricLineArray.length; i<l; i++) {
    var matchContent = lyricLineArray[i].match(timeStampPattern)
    if(matchContent) {
      //get the text of each line 
      tmpT = lyricLineArray[i].split(/\[.+\]/g)
      text = tmpT[tmpT.length-1] || '' 
      //get the time
      for(var j=0; j<matchContent.length; j++) {
        tmpS = matchContent[j].substring(1, matchContent[j].length - 1).split(':')
        time = (+tmpS[0]) * 60 + (+tmpS[1])
        objArr.push({
          'time': time,
          'text': text,
        })
      }   
    }
  }

  objArr.sort(function(a, b){
    return a.time-b.time
  })
  this.objArr = objArr
  return objArr
}

Music.prototype.appendLyric = function(objArr) {
  var lyricElem = document.querySelector('.lyric')
  var html = ''
  for(var i=0; i<objArr.length; i++) {
    html += '<li id=line-' + i + '>' + objArr[i].text + '</li>'
  }
  lyricElem.innerHTML = html
}

Music.prototype.updateLyric = function() {
  var lyricElem = document.querySelector('.lyric')
  if(!this.objArr) {
    return
  }
  for(var i = 0, l = this.objArr.length; i < l; i++) {
    if(this.music.currentTime > this.objArr[i].time - 0.50) {
      var currentLine = document.querySelector('#line-' + i),
      prevLine = document.querySelector('#line-' + (i > 0 ? i - 1 : i))
      currentLine.classList.add('playing')
      prevLine.classList.remove('playing')
      lyricElem.style.top = 102.4 - currentLine.offsetTop + 'px'
    }
  }
}

Music.prototype.timeUpdateBinding = function() {
  var _this = this
  this.music.addEventListener('timeupdate', function() {
    _this.updateLyric()
  })
}
Music.prototype.downLoadBinding = function() {
  var _this = this
  var downloadBtn = document.querySelector('.icon-download')
  downloadBtn.addEventListener('click', function() {
    console.log(1)
    var tmpA = document.createElement('a')
    tmpA.href = _this.songsInfoArrays[_this.musicIndex].url
    tmpA.download
    tmpA.click()
    delete tmpA
  })
}

var m = new Music()
