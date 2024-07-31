/**
 * Create a slider for new slider type.
 * @param {*} data Freedeck Button Config
 * @param {*} keyObject Key Object
 */
export default function(data, keyObject) {
  const sliderelement = document.createElement('input');
  sliderelement.type = 'range';
  sliderelement.min = data.data.min;
  sliderelement.max = data.data.max;
  sliderelement.step = data.data.step;
  sliderelement.value = data.data.value;
  sliderelement.style.width = '100%';
  sliderelement.style.height = '100%';
  keyObject.appendChild(sliderelement);
  if (data.data.direction === 'vertical') {
    sliderelement.className = 'btn-slider';
    sliderelement.style.transform = 'rotate(270deg)';
    // make slider hitbox bigger
  }
  // background tint should match value
  // stop the event from propagating
  const eventHandler = (ev) => {
    ev.stopPropagation();
    sliderelement.style.background = 'linear-gradient(to right, #f00 ' + sliderelement.value + '%, #fff ' + sliderelement.value + '%)';
  };
  sliderelement.onmousemove = eventHandler;
  sliderelement.onmousedown = eventHandler;
  sliderelement.onmouseup = eventHandler;
  sliderelement.ontouchstart = eventHandler;
  sliderelement.ontouchmove = eventHandler;
  sliderelement.ontouchend = eventHandler;
  keyObject.onclick = (ev) => {
    universal.send(
        universal.events.keypress,
        JSON.stringify({
          isSlider: true,
          event: ev,
          btn: data,
        }),
    );
  };
};
