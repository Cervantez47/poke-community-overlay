/* How To Use:
  Use Any Mode and add parameters to the URL.
  Params:
  - spawn: Show/Hide the Spawn Image
      No Param: Default Parameter set to 'pic'.
      gif: Show the Spawn GIF.
      pic: Show the Spawn IMG.
      hide: Hide Spawn Image.
  - timer: Show/Hide the Timer
      No Param: Default Parameter shows the Timer.
      true: Show Timer
      false: Hide Timer
  - audio: Play/Mute Audio
      No Param: Default to Mute Audio.
      true: Play Audio.
      false: Mute Audio.
*/

const backend_url = "https://poketwitch.bframework.de/",
  image_url = "https://dev.bframework.de/";

const urlParams = new URLSearchParams(window.location.search),
  spawn = urlParams.get("spawn") ?? "pic",
  timer = urlParams.get("timer") !== "false",
  audio = urlParams.get("audio") === "true";

var sprite = document.getElementById("sprite-image"),
  countdown = document.getElementById("countdown"),
  legend = document.getElementById("legend"),
  sAud1 = document.getElementById("audio-1"),
  sAud2 = document.getElementById("audio-2");
var last_pokedex_id = 0,
  next_spawn,
  pokedex_id,
  order;

sAud1.volume = 0.1;
sAud2.volume = 0.1;

if (spawn === "hide") {
  sprite.style = "display:none;";
}

if (timer !== true) {
  countdown.style = "display: none;";
}

function display_image(string) {
  sprite.src = image_url + string;
}

function str_pad_left(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

async function fetch_data() {
  await fetch(backend_url + "info/events/last_spawn/")
    .then((res) => res.json())
    .then((data) => {
      next_spawn = data.next_spawn;
      pokedex_id = data.pokedex_id;
      order = data.order;
    })
    .catch((error) => {
      next_spawn = 0;
      pokedex_id = 0;
      order = 0;
      display_image("static/pokedex/sprites/question512.png");
    });
}

async function mainloop() {
  await fetch_data();
  function cooldown_wait() {
    if (next_spawn >= 0) {
      if (timer) {
        // setup timer
        var minutes = Math.floor(next_spawn / 60);
        var seconds = next_spawn - minutes * 60;

        countdown.innerHTML =
          str_pad_left(minutes, "0", 2) + ":" + str_pad_left(seconds, "0", 2);
      }

      if (next_spawn > 810 && last_pokedex_id !== pokedex_id) {
        // 13  minutes 30 seconds and different pokemon
        last_pokedex_id = pokedex_id;

        if (audio) {
          sAud1.play();
          setTimeout(function () {
            sAud1.pause();
            sAud1.currentTime = 0;
          }, 3000);
        }

        legend.classList.toggle("catchPokemon");

        if (spawn === "gif") {
          display_image("static/pokedex/sprites/front/" + pokedex_id + ".gif");
        } else if (spawn === "pic") {
          display_image(
            "static/pokedex/png-high-res-sprites/pokemon/" + order + ".png"
          );
        }

        // remove picture in 90 seconds
        var hide_picture_seconds = next_spawn - 810;
        setTimeout(function () {
          legend.classList.toggle("catchPokemon");

          display_image("static/pokedex/sprites/question512.png");
          if (audio) {
            sAud2.play();
          }
        }, hide_picture_seconds * 1000);

        // reset image at 810 seconds
      }
      setTimeout(function () {
        cooldown_wait();
      }, 1000);
    } else {
      setTimeout(function () {
        mainloop();
      }, 1000);
    }
    next_spawn -= 1;
  }
  cooldown_wait();
}

mainloop();
