/**
* 解析歌词字符串
* 得到一个歌词对象的数组
* 每个歌词对象：{time: 开始时间, lyric: 歌词内容}
*/
function parseLrc() {
    // 1. 把歌词按照\n分割成一行一行
    let lrcArr = lrc.split("\n");

    // 2. result = []
    let result = [];

    // 3. 遍历分割后的数组
    lrcArr.forEach((item, index) => {
        // 4. 按照] 分割时间和歌词内容
        let oneLrcArr = item.split("]");
        // 5. 把时间内容用substring去掉[
        let timeStr = oneLrcArr[0].substring(1);
        let lyric = oneLrcArr[1];
        // 6. 把时间和歌词内容放到obj中
        let lrcObj = {
            time: parseTime(timeStr),
            lyric
        }
        // 7. 把结果放到result中，并且返回
        result.push(lrcObj);
    })
    return result;
}
let lrcData = parseLrc();

/**
* @param {String} timeStr 时间字符串
* @returns
*/
function parseTime(timeStr) {
    // 把时间字符串按照：分割，将前后两部分转换成数字相加返回
    let timeArr = timeStr.split(":");
    let time = +timeArr[0] * 60 + +timeArr[1];
    return time;
}

// 获取需要的DOM
let doms = {
    audio: document.querySelector('audio'),
    ul: document.querySelector(".container ul"),
    container: document.querySelector(".container"),
};

/**
* 计算出，在当前播放器播放到第几秒的情况下，lrcData数组中，应该高亮显示的歌词下标。
* 如果没有任何一句歌词需要显示，就是-1
*/
function findIndex() {
    // 获取当前播放器播放到第几秒
    let currentTime = doms.audio.currentTime;
    // 遍历，当前时间 < 数组的time，取出下标-1
    for (let i = 0; i < lrcData.length; i++) {
        if (currentTime < lrcData[i].time) {
            return i - 1;
        }
    }
    // 循环结束找遍都没有找到（说明播放到最后一句），就单独处理返回最后一句
    return lrcData.length - 1;
}

function createLrcElements() {
    // 文档片段
    let fragment = document.createDocumentFragment();

    // 循环遍历，创建li，给li加内容，获取ul，东西放到ul中
    for (let i = 0; i < lrcData.length; i++) {
        let li = document.createElement("li");
        li.textContent = lrcData[i].lyric;
        //doms.ul.appendChild(li);   // 改动了dom树（但是不要率先优化 - 优化：文档片段）
        fragment.appendChild(li);
    }
    doms.ul.appendChild(fragment);
}
createLrcElements();

/**
* 设置 ul 元素的偏移量
*/
// 容器高度
let containerHight = doms.container.clientHeight;
// li的高度
let firstLiHight = doms.ul.children[0].clientHeight;
// 最大边界 = ul的高度 - 容器的高度
let maxOffset = doms.ul.clientHeight - containerHight;

function setOffset() {
    // 获得当前第几句歌词
    let index = findIndex();
    let offset = firstLiHight * index + firstLiHight / 2 - containerHight / 2;
    // 边界判断
    if (offset < 0) {
        offset = 0;
    }
    if (offset > maxOffset) {
        offset = maxOffset;
    }
    // 偏移量设置给ul
    doms.ul.style.transform = `translateY(-${offset}px)`;

    //设置active
    let li = doms.ul.querySelector(".active");
    if(li){
        // 去掉之前的active 样式
        li.classList.remove("active");
    }
    // 获取当前需要高亮的li
    li = doms.ul.children[index];
    if(li){
        li.classList.add("active");
    }
}

/**
 * 事件
*/
doms.audio.addEventListener("timeupdate", setOffset);