const truncateStatusLength = 38;
const presetNames = ["freecodecamp", "comster404"];
const liveStreamers = 5;
let masterArr = [];

$(document).ready(function () {
   $('#logo-box').bigtext();
   fetchStreamsFromNames(presetNames, processDataFromNames);
});

$(window).load(function () {
   centerLogo();
});

let resizeId;
$(window).resize(function () {
   clearTimeout(resizeId);
   resizeId = setTimeout(doneResizing, 200); // sets the milliseconds to wait before completing resizing functions
});

function doneResizing() {
   // All the functions you want to execute after resize go here
   centerLogo();
}

function centerLogo() {
   let logoHeight = $('#logo-box').outerHeight();
   let wrapperHeight = $('.js-img-height').outerHeight();
   $('#logo-box').css({
      'margin-top': (wrapperHeight - logoHeight) * 0.48
   });
}

function fetchStreamsFromNames(nameArr, processDataFromNames) {
   let arrFromNames = [];
   let countdown = nameArr.length;
   nameArr.forEach(function (name) {
      $.ajax({
         url: "https://api.twitch.tv/kraken/streams/" + name,
         dataType: 'jsonp',
         success: function (data) {
            let obj = {};
            obj.name = name;
            obj.data = data;
            arrFromNames.push(obj);
            countdown--;
            if (countdown === 0) {
               processDataFromNames(arrFromNames, fetchStreamsFromLive);
            }
         }
      });
   });
}

function processDataFromNames(arrFromNames, fetchStreamsFromLive) {
   arrFromNames.forEach(function (fetchedName){
      let obj = {};
      obj.name = fetchedName.name;
      if (_.has(fetchedName.data.stream, 'preview')) {
         obj.status = _.truncate(fetchedName.data.stream.channel.status, {'length': truncateStatusLength});
         obj.link = fetchedName.data.stream.channel.url;
         obj.viewers = fetchedName.data.stream.viewers;
         obj.order = fetchedName.data.stream.viewers;
         obj.image = fetchedName.data.stream.preview.large;
      }
      else if (fetchedName.data.stream === null) {
         obj.status = "Offline";
         obj.link = "https://www.twitch.tv/" + fetchedName.name;
         obj.viewers = 0;
         obj.order = 0;
         obj.image = `public/twitchlist-offline-${_.random(1,9)}.jpg`;
      }
      else {
         obj.status = "Account closed or nonexistent";
         obj.link = "https://www.twitch.tv/" + fetchedName.name;
         obj.viewers = 0;
         obj.order = -1;
         obj.image = `public/twitchlist-closed-${_.random(1,9)}.jpg`;
      }
      masterArr.push(obj);
   });
   fetchStreamsFromLive(processDataFromLive);
}

function fetchStreamsFromLive(processDataFromLive) {
   $.getJSON(`https://api.twitch.tv/kraken/streams?stream_type=live&limit=${liveStreamers}&language=en&callback=?`, function (data) {
      processDataFromLive(data.streams, fetchStreamFromInput);
   });
}

function processDataFromLive(dataArr, fetchStreamFromInput) {
   let countdown = dataArr.length;
   dataArr.forEach(function (data) {
      let obj = {};
      obj.name = data.channel.name;
      obj.status = _.truncate(data.channel.status, {'length': truncateStatusLength});
      obj.link = data.channel.url;
      obj.viewers = data.viewers;
      obj.order = data.viewers;
      obj.image = data.preview.large;
      masterArr.push(obj);
      countdown--;
      if (countdown === 0) {
         fetchStreamFromInput(processDataFromInput);
      }
   });

}

function fetchStreamFromInput(processDataFromInput) {
   // don't forget to URI encode!
   processDataFromInput(sortByOrder);
}

function processDataFromInput(sortByOrder) {
   sortByOrder(displayMasterArr);

}

function sortByOrder(displayMasterArr) {
   let sortedArr = _.sortBy(masterArr, function(obj) { return obj.order; }).reverse();
   displayMasterArr(sortedArr);
}

function sortByName(formattedArr) {

}

function displayMasterArr(sortedArr) {
   $( "#streams-parent" ).empty(); // empties the previous results
   $.each(sortedArr, function(index, obj) {
      $("#streams-parent").append(`<a href="${obj.link}" target="_blank"><div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-3"><div class="card"><img class="card-img-top img-fluid" src="${obj.image}"><div class="card-block"><h4 class="card-title">${obj.name}</h4><p class="card-text"><span class="text-muted">Viewers:&nbsp;</span>${obj.viewers}<br/><span class="text-muted">Status:&nbsp;</span>${obj.status}</p></div></div></div></a>`);
   });
}
