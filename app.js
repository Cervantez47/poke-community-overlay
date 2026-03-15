/* How To Use:
  Add parameters to the URL.
  Params:
  - spawn: Controls the Spawn Image type
      No Param: Default set to 'pic'.
      gif: Show the Spawn GIF.
      pic: Show the Spawn IMG.
  - audio: Play/Mute Audio
      No Param: Default to Mute Audio.
      true: Play Audio.
      false: Mute Audio.
*/

const backend_url = "https://poketwitch.bframework.de/",
  image_url = "https://dev.bframework.de/";

const urlParams = new URLSearchParams(window.location.search),
  spawn = urlParams.get("spawn") ?? "pic",
  audio = urlParams.get("audio") === "true";

var sprite = document.getElementById("sprite-image"),
  sAud1 = document.getElementById("audio-1"),
  sAud2 = document.getElementById("audio-2");
var last_pokedex_id = 0,
  next_spawn,
  pokedex_id,
  order;

sAud1.volume = 0.1;
sAud2.volume = 0.1;

function display_image(string) {
  sprite.src = image_url + string;
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
    });
}

async function mainloop() {
  await fetch_data();
  function cooldown_wait() {
    if (next_spawn >= 0) {
      if (next_spawn > 810 && last_pokedex_id !== pokedex_id) {
        // 13 minutes 30 seconds and different pokemon — catch window open
        last_pokedex_id = pokedex_id;

        if (audio) {
          sAud1.play();
          setTimeout(function () {
            sAud1.pause();
            sAud1.currentTime = 0;
          }, 3000);
        }

        if (spawn === "gif") {
          display_image("static/pokedex/sprites/front/" + pokedex_id + ".gif");
        } else {
          display_image(
            "static/pokedex/png-high-res-sprites/pokemon/" + order + ".png"
          );
        }
        sprite.style.display = "block";

        // Hide image when catch window closes
        var hide_picture_seconds = next_spawn - 810;
        setTimeout(function () {
          sprite.style.display = "none";
          if (audio) {
            sAud2.play();
          }
        }, hide_picture_seconds * 1000);
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
