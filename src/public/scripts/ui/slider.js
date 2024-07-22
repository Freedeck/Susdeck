/**
 * Create a slider for new slider type.
 * @param {*} data Freedeck Button Config
 * @param {*} keyObject Key Object
 */
export default function(data, keyObject) {
  const sliderelement = document.createElement('input');
  sliderelement.type = 'range';
  sliderelement.min = 0;
  sliderelement.max = 100;
  sliderelement.value = data.data.value;
  sliderelement.style.width = '100%';
  sliderelement.style.height = '100%';
  if (data.data.direction === 'vertical') {
    sliderelement.style.transform = 'rotate(270deg)';
  }
  keyObject.appendChild(sliderelement);
};
