/* =========================================================
   story.js
   全部剧情、线索、对话、结局
   结局：15 章完整故事，黑屏逐行显示
   ========================================================= */

window.STORY = {
    /* ---------- 起点 ---------- */
    startScene: 'road',
    startPos: { x: 0, y: 0, z: 25 },
    startYaw: 0,

    /* =========================================================
       线索列表
       ========================================================= */
    clues: {
        'road_sign': {
            name: '路牌',
            desc: '城北工业区路牌。\n老电厂 1.2km，化工厂 2.8km。'
        },
        'gate_guard': {
            name: '门卫室值班记录',
            desc: '值班记录最后一页停在1989年9月14日。'
        },
        'hall_desk': {
            name: '没写完的便签',
            desc: '「关于桩基水泥标号问题，我建议…」\n写到这里就断了。'
        },
        'ctrl_console': {
            name: '值班日志',
            desc: '1989年9月14日：有人反映水泥有问题。\n后面没有了。'
        },
        'ctrl_radio': {
            name: '收音机广播',
            desc: '「…临江市…二期工程…顺利…」\n「…失踪…外来务工人员…」'
        },
        'ctrl_cab': {
            name: '验收报告',
            desc: '《二期工程桩基验收报告》签字栏是空的。\n下面压着一份没署名的材料。'
        },
        'pwr_roster': {
            name: '工地花名册',
            desc: '「陈广志，男，32岁，籍贯：皖北」\n名字被红笔圈了三圈。\n批注：该员工作表现异常，建议清退。'
        },
        'pwr_cab': {
            name: '配电柜上的字',
            desc: '一扇门上用粉笔写着两个字：别碰。'
        },
        'pwr_trans': {
            name: '变压器',
            desc: '停转多年。\n凑近能听到极微弱的嗡嗡声。\n像电流，又像有人在很远的地方说话。'
        },
        'turbine_box': {
            name: '手绘地图',
            desc: '一张卷起来的纸。\n标出了三个位置：控制室、配电房、桩基。'
        },
        'tun_t1': {
            name: '墙上的字（一）',
            desc: '「9月10日 三班 水泥到货」\n后面还有一行更小的字，被人用指甲刮花了。\n只能隐约看出一个「不」字。'
        },
        'tun_t2': {
            name: '墙上的字（二）',
            desc: '墙上用钉子刻着几个字。\n「广志 9.12」'
        },
        'tun_t3': {
            name: '墙上的刮痕',
            desc: '几道很深的刮痕。\n像是有人用指甲抓过。\n方向指向隧道更深处。'
        },
        'chem_letter': {
            name: '举报信草稿',
            desc: '关于桩基水泥标号问题的反映。\n写得工整。\n反映人那一栏是空的。'
        },
        'chem_cab': {
            name: '全家福',
            desc: '照片上是一个女人和两个孩子，站在土墙瓦房前。\n背面：秀兰、大丫、小柱，1988年冬。'
        },
        'chem_speaker': {
            name: '广播',
            desc: '「…先进工作者…陈广志…」\n然后是一阵电流声。'
        },
        'wh_cup': {
            name: '搪瓷杯',
            desc: '「先进工作者 · 1989」\n杯底压着一张纸片：陈广志 47号桩。'
        },
        'wh_shelf': {
            name: '水泥袋',
            desc: '标号全是325。\n没有一袋是425。'
        },
        'col_bones': {
            name: '遗骨',
            desc: '塌陷的水泥块下面，露出一截骨头。\n旁边有一块蓝色的确良布。\n还有半张汇款单。'
        },
        'col_mark': {
            name: '桩位标记',
            desc: '47号。\n旁边有香灰和纸钱。\n有人来过。不是来救他的。'
        }
    },

    /* =========================================================
       对象交互
       ========================================================= */
    objects: {

        /* ---------- 江北大道 ---------- */
        'road_sign': {
            name: '路牌',
            clue: true,
            dialogue: '一块锈蚀的路牌。\n\n上面写着：\n「城北工业区」\n「老电厂 → 1.2km」\n「化工厂 → 2.8km」'
        },

        /* ---------- 老电厂大门 ---------- */
        'gate_iron': {
            name: '铁门',
            dialogue: '铁栅栏门锈得厉害。\n\n锁早就坏了。\n推一下就能开。'
        },
        'gate_guard': {
            name: '门卫室',
            clue: true,
            dialogue: '门卫室的门虚掩着。\n\n里面一张桌子，一把椅子。\n桌上放着一本值班记录。\n\n最后一页停在 1989 年 9 月 14 日。\n\n字迹很潦草，只写了半句：\n「今晚加班……」'
        },

        /* ---------- 主楼大厅 ---------- */
        'hall_desk': {
            name: '接待台',
            clue: true,
            dialogue: '接待台后面空无一人。\n\n抽屉开着，里面有一支钢笔，\n和一张没写完的便签：\n\n「关于桩基水泥标号问题，我建议…」\n\n字迹到这里就断了。'
        },
        'hall_stair': {
            name: '楼梯',
            dialogue: '楼梯通向二楼。\n\n台阶上落满灰。\n看起来很久没人走过了。\n\n扶手上有几个手印，\n往下走的方向。'
        },

        /* ---------- 控制室 ---------- */
        'ctrl_console': {
            name: '控制台',
            clue: true,
            dialogue: '控制台后面是一排仪表盘。\n\n指针全部停在零点。\n\n台面上有一本值班日志。\n\n最后一页写着：\n「1989年9月14日。\n有人反映水泥有问题。\n已上报。」\n\n后面没有了。'
        },
        'ctrl_radio': {
            name: '收音机',
            clue: true,
            dialogue: '一台积灰的老式收音机。\n\n打开后，里面传来断断续续的广播：\n\n「…临江市…二期工程…顺利…」\n「…表彰…先进…」\n「…失踪…外来务工人员…」\n\n信号中断。',
            onInteract: function() {
                if (window.playSfx) playSfx('radio');
            }
        },
        'ctrl_cab': {
            name: '文件柜',
            clue: true,
            dialogue: '文件柜里塞满了图纸和文件。\n\n最上面那份是《二期工程桩基验收报告》，\n签字栏是空的。\n\n最下面压着一份手写的材料，\n标题是：「关于桩基水泥标号的紧急反映」。\n\n没有署名。'
        },
        'ctrl_clock': {
            name: '挂钟',
            dialogue: '挂钟停在 1 点 47 分。\n\n不知道是哪一天的 1 点 47 分。\n\n钟摆是歪的，像是被人撞过。'
        },

        /* ---------- 配电房 ---------- */
        'pwr_roster': {
            name: '工地花名册',
            clue: true,
            dialogue: '一本工地花名册。\n\n密密麻麻的名字，大部分是外地人。\n\n翻到第 47 页：\n\n「陈广志，男，32岁，籍贯：皖北」\n\n名字被红笔圈了三圈。\n\n旁边批注：\n「该员工作表现异常，建议清退。」'
        },
        'pwr_cab': {
            name: '配电柜',
            clue: true,
            dialogue: '一排配电柜。\n\n其中一扇门上用粉笔写了两个字：\n\n「别碰」\n\n字迹很轻，像是匆忙写的。'
        },
        'pwr_trans': {
            name: '变压器',
            clue: true,
            dialogue: '巨大的变压器已经停转多年。\n\n但凑近的时候，\n能听到里面传来极其微弱的嗡嗡声。\n\n像是电流，\n又像是有人在很远的地方说话。'
        },

        /* ---------- 涡轮大厅 ---------- */
        'turbine_1': {
            name: '涡轮机',
            dialogue: '巨大的涡轮机停在原地。\n\n叶轮上落满灰。\n\n底座上有一个铭牌：\n「1987年 · 上海制造」'
        },
        'turbine_2': {
            name: '涡轮机',
            dialogue: '第二台涡轮机。\n\n和第一台一样，叶轮上落满灰。\n\n墙角有一根撬棍，斜靠在涡轮机上。\n\n撬棍上有暗红色的痕迹，已经干了。'
        },
        'turbine_box': {
            name: '工具箱',
            clue: true,
            dialogue: '一个铁皮工具箱。\n\n里面有一把旧扳手、\n半包受潮的烟、\n一张卷起来的纸。\n\n纸上是手绘的工厂地图，\n标出了三个位置：\n「控制室」「配电房」「桩基」'
        },
        'turbine_tunnel': {
            name: '隧道门',
            dialogue: '两台涡轮机之间，\n有一道铁门。\n\n门上写着：\n「电缆隧道 · 通往化工厂」\n\n门是开的。'
        },

        /* ---------- 电缆隧道 ---------- */
        'tun_t1': {
            name: '墙上的字',
            clue: true,
            dialogue: '墙上用粉笔写着一行字：\n\n「9月10日 三班 水泥到货」\n\n字迹很淡，几乎看不清了。\n\n后面还有一行更小的字，\n被人用指甲刮花了。\n只能隐约看出一个「不」字。'
        },
        'tun_t2': {
            name: '墙上的字',
            clue: true,
            dialogue: '墙上用钉子刻着几个字。\n\n「广志 9.12」\n\n像是随手刻的。'
        },
        'tun_t3': {
            name: '墙上的刮痕',
            clue: true,
            dialogue: '墙上有几道很深的刮痕。\n\n像是有人用指甲抓过。\n\n抓痕的方向指向隧道的更深处。'
        },

        /* ---------- 化工厂车间 ---------- */
        'chem_letter': {
            name: '举报信草稿',
            clue: true,
            dialogue: '工作台上有一张揉皱的纸。\n\n展开后是：\n\n「关于二期工程桩基质量的反映」\n\n一、3号桩位水泥标号不足，\n    实际使用325号，图纸要求425号。\n\n二、钢筋数量比图纸少放12根。\n\n三、本人多次向工头反映，\n    均被压制。\n\n反映人：（空白）\n1989年9月10日」\n\n署名那一栏是空的。'
        },
        'chem_cab': {
            name: '工具柜',
            clue: true,
            dialogue: '工具柜里挂着一件旧工装。\n\n工装口袋里有一张照片。\n\n照片上是一个女人和两个孩子，\n背后是土墙瓦房。\n\n照片背面写着：\n「秀兰、大丫、小柱，1988年冬」'
        },
        'chem_speaker': {
            name: '广播喇叭',
            clue: true,
            dialogue: '墙上挂着一个旧广播喇叭。\n\n突然，它响了。\n\n「…表彰…二期工程…\n 先进工作者…\n 陈广志同志…」\n\n然后是一阵刺耳的电流声。\n\n陈广志。\n\n他不是失踪了吗。',
            onInteract: function() {
                if (window.playSfx) playSfx('radio');
            }
        },

        /* ---------- 仓库 ---------- */
        'wh_cup': {
            name: '搪瓷杯',
            clue: true,
            dialogue: '一个搪瓷杯，倒在地上。\n\n杯身上印着红字：\n「先进工作者 · 1989」\n\n杯子底下压着一张纸片，\n上面写着：\n「陈广志 47号桩」\n\n字迹和花名册上的批注一样。'
        },
        'wh_shelf': {
            name: '货架',
            clue: true,
            dialogue: '货架上堆满了水泥袋。\n\n随手翻了几袋，\n标号全是「325」。\n\n没有一袋是425。'
        },

        /* ---------- 塌陷区 ---------- */
        'col_mark': {
            name: '桩位标记',
            clue: true,
            dialogue: '水泥柱上有一个编号：\n\n「47」\n\n旁边有香灰的痕迹，\n和几片没烧完的纸钱。\n\n有人来过。\n\n不是来救他，\n是来求他别闹。'
        },
        'col_bones': {
            name: '遗骨',
            clue: true,
            isEnding: true,
            dialogue: '塌陷的水泥块下面，\n露出了一截骨头。\n\n旁边有一块蓝色的确良布，\n已经褪成了灰白色。\n\n还有半张汇款单，\n字迹模糊，但能认出：\n\n「陈广志」\n「安徽 阜阳」\n\n他就埋在这里。\n\n三十年了。'
        }
    },

    /* =========================================================
       密码
       ========================================================= */
    puzzles: {},

    /* =========================================================
       结局 · 15 章完整故事
       ========================================================= */
    ending: [
        { text: '', pause: 1500 },

        /* ---------- 一 ---------- */
        { text: '一', pause: 2500, big: true },

        { text: '1989年春天', pause: 1200 },
        { text: '陈广志从安徽阜阳陈庄出来的时候', pause: 1500 },
        { text: '村里人跟他说：', pause: 800 },
        { text: '「广志，你这一去，就是城里人了。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '他没说话', pause: 1000 },
        { text: '他背着蛇皮袋', pause: 1000 },
        { text: '里面是秀兰给他缝的被子', pause: 1200 },
        { text: '六个煮鸡蛋', pause: 800 },
        { text: '一双新布鞋', pause: 1200 },
        { text: '他坐了十四个小时硬座', pause: 1200 },
        { text: '到了临江', pause: 2000 },

        { text: '', pause: 800 },

        { text: '工地在城北', pause: 1000 },
        { text: '江北大道往西', pause: 1000 },
        { text: '过了老电厂就是', pause: 1000 },
        { text: '一片荒地，几排工棚', pause: 1500 },
        { text: '工棚是油毛毡搭的', pause: 1200 },
        { text: '夏天热得像蒸笼', pause: 1000 },
        { text: '冬天冷得睡不着', pause: 1000 },
        { text: '一个棚子住十二个人', pause: 1200 },
        { text: '通铺', pause: 800 },
        { text: '脚臭味混着汗味', pause: 1200 },
        { text: '半夜有人打呼噜、有人磨牙、有人哭', pause: 2400 },

        { text: '', pause: 800 },

        { text: '陈广志住最里面那个铺', pause: 1200 },
        { text: '他不跟人说话', pause: 1200 },
        { text: '下了工，别人打牌，他蹲在门口抽烟', pause: 1500 },
        { text: '别人喝酒，他喝水', pause: 1200 },
        { text: '别人去街上溜达', pause: 1000 },
        { text: '他躺在铺上', pause: 1000 },
        { text: '看着工棚顶上的油毛毡发呆', pause: 2000 },

        { text: '', pause: 800 },

        { text: '工友叫他「闷葫芦」', pause: 1500 },
        { text: '没人知道他叫什么', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '他每个月寄钱回家', pause: 1200 },
        { text: '第一个月，他寄了八十', pause: 1200 },
        { text: '第二个月，他寄了九十五', pause: 1200 },
        { text: '第三个月，他寄了一百一', pause: 1500 },
        { text: '他给自己留的钱越来越少', pause: 1500 },
        { text: '他不吃肉，不买衣服，不抽烟', pause: 1500 },
        { text: '偶尔抽，抽最便宜的', pause: 1000 },
        { text: '八分钱一包', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '他给秀兰写信', pause: 1200 },
        { text: '信上写：', pause: 1200 },

        { text: '', pause: 800 },

        { text: '秀兰：', pause: 1000 },
        { text: '我这边挺好', pause: 1000 },
        { text: '工钱按天算，一天六块五', pause: 1200 },
        { text: '干满一个月能拿小两百', pause: 1200 },
        { text: '管住不管吃', pause: 1000 },
        { text: '我自己做饭，花不了几个钱', pause: 1200 },
        { text: '娘药别断', pause: 1000 },
        { text: '大丫学费该交了，别省', pause: 1200 },
        { text: '小柱鞋破了就买新的', pause: 1200 },
        { text: '你注意身体', pause: 2200 },

        { text: '', pause: 1000 },

        { text: '这些话有一半是假的', pause: 1800 },
        { text: '他一天拿六块五', pause: 1200 },
        { text: '但不是天天有活', pause: 1200 },
        { text: '下雨停工，等材料停工，工序接不上停工', pause: 2400 },
        { text: '一个月干二十天算好的', pause: 1500 },
        { text: '他实际到手一百三', pause: 1500 },
        { text: '他跟家里说有「小两百」', pause: 1200 },
        { text: '是想让秀兰放心', pause: 2800 },

        /* ---------- 二 ---------- */
        { text: '', pause: 1500 },
        { text: '二', pause: 2500, big: true },

        { text: '工地上在打桩', pause: 1800 },

        { text: '二期扩建工程', pause: 1200 },
        { text: '要建一栋新的发电机组厂房', pause: 1200 },
        { text: '地基下面要打四十七根桩', pause: 1200 },
        { text: '每根桩打到地下十几米', pause: 1200 },
        { text: '灌满水泥', pause: 1000 },
        { text: '桩打好了，上面才能浇地基、起楼', pause: 2400 },

        { text: '', pause: 800 },

        { text: '陈广志不是打桩的', pause: 1200 },
        { text: '他是杂工', pause: 1000 },
        { text: '搬砖、和水泥、扛钢筋', pause: 1200 },
        { text: '但他以前在老家修过水库', pause: 1500 },
        { text: '见过水泥', pause: 1000 },
        { text: '认得水泥', pause: 1000 },
        { text: '他一看就知道，这批水泥不对', pause: 2400 },

        { text: '', pause: 800 },

        { text: '图纸上要求的是425号水泥', pause: 1500 },
        { text: '425号是标号', pause: 1000 },
        { text: '强度高，凝固快', pause: 1200 },
        { text: '用来打桩、浇地基', pause: 1200 },
        { text: '但工地上用的这批水泥', pause: 1200 },
        { text: '袋子上的字是「325」', pause: 1800 },
        { text: '325号标号低', pause: 1000 },
        { text: '强度差', pause: 800 },
        { text: '用来砌墙、抹灰还行', pause: 1200 },
        { text: '用来打桩，就是糊弄', pause: 2400 },

        { text: '', pause: 1000 },

        { text: '他先跟工头说', pause: 1800 },

        { text: '工头姓赵，叫赵大勇', pause: 1200 },
        { text: '赵大勇三十多岁，本地人', pause: 1200 },
        { text: '膀大腰圆，脾气暴', pause: 1200 },
        { text: '陈广志跟他说水泥标号不对', pause: 1500 },
        { text: '赵大勇瞪了他一眼：', pause: 1200 },
        { text: '「你懂什么？你一个搬砖的，你懂水泥？」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '陈广志说：', pause: 800 },
        { text: '「我在老家修过水库，425和325我认得。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '赵大勇说：', pause: 800 },
        { text: '「你认得个屁。」', pause: 1200 },
        { text: '「上面让用什么就用什么，你管好你自己的活。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '陈广志没说话', pause: 1000 },
        { text: '他走了', pause: 2400 },

        /* ---------- 三 ---------- */
        { text: '', pause: 1500 },
        { text: '三', pause: 2500, big: true },

        { text: '他又去找技术员', pause: 1500 },

        { text: '技术员姓孙，叫孙志强', pause: 1200 },
        { text: '孙志强二十多岁，中专毕业', pause: 1200 },
        { text: '戴眼镜，说话慢条斯理', pause: 1200 },
        { text: '陈广志跟他说水泥的问题', pause: 1200 },
        { text: '孙志强看了他一眼，说：', pause: 1200 },
        { text: '「这批水泥是上面定的，手续齐全。你不用管。」', pause: 2800 },

        { text: '', pause: 800 },

        { text: '陈广志说：', pause: 800 },
        { text: '「手续齐全，但水泥标号不够。」', pause: 1500 },
        { text: '「这桩打下去，以后要出事的。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '孙志强说：', pause: 800 },
        { text: '「你一个工人，你操这个心干什么？」', pause: 1800 },
        { text: '「天塌下来有高个子顶着。」', pause: 2200 },

        { text: '', pause: 800 },

        { text: '陈广志说：', pause: 800 },
        { text: '「这楼要住人的。」', pause: 2800 },

        { text: '', pause: 800 },

        { text: '孙志强没理他', pause: 1200 },
        { text: '走了', pause: 2400 },

        /* ---------- 四 ---------- */
        { text: '', pause: 1500 },
        { text: '四', pause: 2500, big: true },

        { text: '陈广志晚上没睡着', pause: 1500 },

        { text: '他躺在铺上，翻来覆去', pause: 1200 },
        { text: '他想到了秀兰', pause: 1000 },
        { text: '想到了大丫', pause: 1000 },
        { text: '想到了小柱', pause: 1000 },
        { text: '想到了老娘的哮喘', pause: 1200 },
        { text: '他知道自己不该管', pause: 1200 },
        { text: '他知道管了没好果子吃', pause: 1500 },
        { text: '他知道他就是个搬砖的', pause: 1500 },
        { text: '人微言轻', pause: 2000 },

        { text: '', pause: 800 },

        { text: '但他还是写了一封信', pause: 2400 },

        { text: '他找工友借了一支圆珠笔', pause: 1200 },
        { text: '找了一张皱巴巴的纸', pause: 1200 },
        { text: '趴在铺上写了一晚上', pause: 1500 },
        { text: '他写得很慢', pause: 1000 },
        { text: '字很丑', pause: 1000 },
        { text: '但很工整', pause: 1200 },
        { text: '他写了三页', pause: 1500 },
        { text: '他说：', pause: 1500 },

        { text: '', pause: 800 },

        { text: '关于城北二期工程桩基水泥标号问题的反映', pause: 2800 },

        { text: '', pause: 800 },

        { text: '一、3号桩位至12号桩位所用水泥', pause: 1500 },
        { text: '实际为325号，图纸要求为425号', pause: 1500 },
        { text: '不符合设计要求', pause: 1500 },

        { text: '', pause: 600 },

        { text: '二、本人多次向工头赵大勇、技术员孙志强反映', pause: 1800 },
        { text: '均被压制', pause: 1500 },

        { text: '', pause: 600 },

        { text: '三、钢筋数量也存在问题', pause: 1500 },
        { text: '比图纸少放12根', pause: 1500 },

        { text: '', pause: 600 },

        { text: '四、本人认为此问题严重', pause: 1500 },
        { text: '如不整改，日后恐有重大安全事故', pause: 2800 },

        { text: '', pause: 800 },

        { text: '反映人：陈广志', pause: 1500 },
        { text: '1989年9月10日', pause: 2800 },

        { text: '', pause: 1000 },

        { text: '第二天早上', pause: 1200 },
        { text: '他走了四十多分钟', pause: 1200 },
        { text: '到了镇上邮局', pause: 1200 },
        { text: '邮局刚开门', pause: 1000 },
        { text: '他是第一个', pause: 1200 },
        { text: '他把信递过去', pause: 1200 },
        { text: '邮局的人是个女的，三十来岁', pause: 1500 },
        { text: '称了称信，说：', pause: 1000 },
        { text: '「八毛。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '陈广志掏口袋', pause: 1500 },

        { text: '', pause: 400 },

        { text: '他掏出一把零钱', pause: 1200 },
        { text: '数了数', pause: 1000 },
        { text: '七毛二', pause: 3500 },

        { text: '', pause: 1000 },

        { text: '他站在柜台前', pause: 1500 },
        { text: '愣住了', pause: 2800 },

        { text: '', pause: 800 },

        { text: '后面有人排队，催他：', pause: 1200 },
        { text: '「快点啊。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '他把信拿回来', pause: 1200 },
        { text: '揣在怀里', pause: 1000 },
        { text: '走了', pause: 2800 },

        { text: '', pause: 1200 },

        { text: '那封信', pause: 1200 },
        { text: '他再也没有寄出去', pause: 3500 },

        { text: '', pause: 1200 },

        { text: '他回到工棚', pause: 1200 },
        { text: '把信压在枕头底下', pause: 1200 },
        { text: '他想', pause: 1000 },
        { text: '等下个月发了工钱', pause: 1200 },
        { text: '再来寄', pause: 3500 }
                ,

        /* ---------- 五 ---------- */
        { text: '', pause: 1500 },
        { text: '五', pause: 2500, big: true },

        { text: '工地上出事了', pause: 1800 },

        { text: '9月12号，3号桩位渗水', pause: 1500 },
        { text: '9月13号，一台搅拌机坏了', pause: 1500 },
        { text: '砸伤了一个工人', pause: 1200 },
        { text: '9月14号早上', pause: 1200 },
        { text: '有人在工地上议论', pause: 1200 },
        { text: '说「这地方邪门」', pause: 2000 },

        { text: '', pause: 800 },

        { text: '工头赵大勇听到了', pause: 1200 },
        { text: '他骂了一句：', pause: 1000 },
        { text: '「邪门个屁。」', pause: 2000 },

        { text: '', pause: 800 },

        { text: '但当天中午', pause: 1000 },
        { text: '他把几个班组长叫到一起', pause: 1200 },
        { text: '说了一件事', pause: 1500 },

        { text: '', pause: 800 },

        { text: '他说：', pause: 800 },
        { text: '「上面说了，得打个桩。」', pause: 2200 },

        { text: '', pause: 800 },

        { text: '有人问：', pause: 800 },
        { text: '「什么桩？」', pause: 1500 },

        { text: '', pause: 800 },

        { text: '赵大勇说：', pause: 800 },
        { text: '「就是……镇一镇。」', pause: 1500 },
        { text: '「你们不懂。」', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '没人懂', pause: 1200 },
        { text: '也没人敢问', pause: 2800 },

        /* ---------- 六 ---------- */
        { text: '', pause: 1500 },
        { text: '六', pause: 2500, big: true },

        { text: '9月14号晚上', pause: 1200 },
        { text: '赵大勇来找陈广志', pause: 1500 },

        { text: '赵大勇很少跟陈广志说话', pause: 1500 },
        { text: '那天晚上他主动来了', pause: 1200 },
        { text: '脸上带着笑', pause: 1200 },
        { text: '他说：', pause: 1000 },
        { text: '「广志，晚上没事吧？走，喝两杯。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '陈广志说：', pause: 800 },
        { text: '「我不喝酒。」', pause: 1800 },

        { text: '', pause: 800 },

        { text: '赵大勇说：', pause: 800 },
        { text: '「不喝酒也行，吃个饭。」', pause: 1500 },
        { text: '「上面领导觉得你不错，想跟你聊聊，」', pause: 1500 },
        { text: '「看你愿不愿意当个小组长。」', pause: 2400 },

        { text: '', pause: 1000 },

        { text: '陈广志犹豫了', pause: 1500 },

        { text: '他不想去', pause: 1000 },
        { text: '他不想跟这些人打交道', pause: 1200 },
        { text: '但他想到那封信还在枕头底下', pause: 1500 },
        { text: '他想', pause: 1000 },
        { text: '也许这是个机会', pause: 1200 },
        { text: '也许可以当面跟领导反映水泥的问题', pause: 2400 },

        { text: '', pause: 800 },

        { text: '他去了', pause: 2000 },

        { text: '', pause: 800 },

        { text: '赵大勇带他去了工地边上的一个小饭馆', pause: 1800 },
        { text: '饭馆里坐着两个人', pause: 1200 },
        { text: '一个是孙志强', pause: 1200 },
        { text: '另一个他不认识', pause: 1200 },
        { text: '四十来岁，穿着夹克衫，手指上戴着金戒指', pause: 2400 },

        { text: '', pause: 800 },

        { text: '赵大勇说：', pause: 800 },
        { text: '「这是刘经理。」', pause: 1800 },

        { text: '', pause: 800 },

        { text: '刘经理站起来，跟陈广志握手', pause: 1500 },
        { text: '说：', pause: 800 },
        { text: '「小陈是吧？坐坐坐。」', pause: 2200 },

        { text: '', pause: 800 },

        { text: '陈广志坐下了', pause: 1500 },

        { text: '刘经理给他倒酒', pause: 1200 },
        { text: '陈广志说：', pause: 800 },
        { text: '「我不会喝。」', pause: 1800 },

        { text: '', pause: 800 },

        { text: '刘经理说：', pause: 800 },
        { text: '「喝一点，没事。」', pause: 2000 },

        { text: '', pause: 800 },

        { text: '陈广志喝了', pause: 1500 },

        { text: '', pause: 600 },

        { text: '他又喝了第二杯', pause: 1800 },

        { text: '', pause: 600 },

        { text: '第三杯的时候', pause: 1200 },
        { text: '他头开始晕', pause: 1500 },
        { text: '他平时不喝酒', pause: 1200 },
        { text: '酒量几乎没有', pause: 1200 },
        { text: '他想站起来', pause: 1200 },
        { text: '但腿发软', pause: 1500 },

        { text: '', pause: 800 },

        { text: '赵大勇扶住他，说：', pause: 1200 },
        { text: '「没事没事，我送你回去。」', pause: 2500 },

        /* ---------- 七 ---------- */
        { text: '', pause: 1500 },
        { text: '七', pause: 2500, big: true },

        { text: '他没有回工棚', pause: 1800 },

        { text: '赵大勇和刘经理架着他', pause: 1200 },
        { text: '往工地里面走', pause: 1200 },
        { text: '工地上晚上没人', pause: 1200 },
        { text: '探照灯灭了', pause: 1200 },
        { text: '只有几盏昏黄的灯泡', pause: 1800 },

        { text: '', pause: 800 },

        { text: '他们走到了一根桩孔边上', pause: 1800 },
        { text: '那是47号桩', pause: 1500 },
        { text: '刚挖好，还没有灌水泥', pause: 1500 },
        { text: '桩孔十几米深', pause: 1500 },
        { text: '黑洞洞的', pause: 1200 },
        { text: '望不到底', pause: 1800 },

        { text: '', pause: 1000 },

        { text: '赵大勇把他推了下去', pause: 2800 },

        { text: '', pause: 1200 },

        { text: '陈广志没有喊', pause: 3000 },

        { text: '', pause: 1200 },

        { text: '后来水泥灌下来的时候', pause: 1500 },
        { text: '他可能已经摔晕了', pause: 1500 },
        { text: '也可能没有', pause: 1500 },
        { text: '没人知道', pause: 3000 },

        /* ---------- 八 ---------- */
        { text: '', pause: 1500 },
        { text: '八', pause: 2500, big: true },

        { text: '第二天早上', pause: 1200 },
        { text: '赵大勇在晨会上说：', pause: 1200 },
        { text: '「陈广志不干了，昨天晚上走了。」', pause: 1500 },
        { text: '「以后谁再想走，提前说一声。」', pause: 2400 },

        { text: '', pause: 1000 },

        { text: '没人问', pause: 1500 },

        { text: '', pause: 800 },

        { text: '没人敢问', pause: 1800 },

        { text: '', pause: 1000 },

        { text: '他隔壁铺的老李问了一句：', pause: 1500 },
        { text: '「他铺盖还在呢？」', pause: 2000 },

        { text: '', pause: 800 },

        { text: '赵大勇说：', pause: 800 },
        { text: '「急着走呗。」', pause: 2000 },

        { text: '', pause: 800 },

        { text: '老李「哦」了一声', pause: 1200 },
        { text: '没再说话', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '三天后', pause: 1200 },
        { text: '47号桩灌满了水泥', pause: 1500 },
        { text: '地基打好了', pause: 1500 },
        { text: '二期工程顺利完工', pause: 3000 }
                ,

        /* ---------- 九 ---------- */
        { text: '', pause: 1500 },
        { text: '九', pause: 2500, big: true },

        { text: '秀兰第一次来，是那年冬天', pause: 1800 },

        { text: '她坐了十四个小时硬座', pause: 1200 },
        { text: '到了临江', pause: 1200 },
        { text: '她找到工地', pause: 1200 },
        { text: '工地已经变成了一片新厂房', pause: 1500 },
        { text: '烟囱冒着白烟', pause: 1200 },
        { text: '她找到工头', pause: 1200 },
        { text: '赵大勇说：', pause: 1000 },
        { text: '「你男人拿了三个月工钱跑了。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '秀兰说：', pause: 800 },
        { text: '「他不可能跑。」', pause: 1200 },
        { text: '「他每个月都往家里寄钱。」', pause: 2200 },

        { text: '', pause: 800 },

        { text: '赵大勇说：', pause: 800 },
        { text: '「那我不管。」', pause: 1200 },
        { text: '「钱给他了，他跑了，你去找他啊。」', pause: 2400 },

        { text: '', pause: 1000 },

        { text: '她在工地门口站了一天', pause: 1500 },
        { text: '没人理她', pause: 1200 },
        { text: '晚上她睡在火车站', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '第二天她去了派出所', pause: 1500 },
        { text: '派出所的人问：', pause: 1000 },
        { text: '「你男人叫什么？哪里人？什么时候不见的？」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '秀兰说：', pause: 800 },
        { text: '「陈广志，安徽阜阳的，九月十四号不见的。」', pause: 2800 },

        { text: '', pause: 800 },

        { text: '派出所的人翻了翻本子，说：', pause: 1500 },
        { text: '「成年男性，自行离开，」', pause: 1200 },
        { text: '「没有证据表明受到侵害。」', pause: 1200 },
        { text: '「立不了案。你回去等消息吧，」', pause: 1500 },
        { text: '「他要是联系你，你再来。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '秀兰说：', pause: 800 },
        { text: '「那他要是永远不联系我呢？」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '派出所的人说：', pause: 800 },
        { text: '「那就没办法了。」', pause: 3000 },

        { text: '', pause: 1000 },

        { text: '她回去了', pause: 2500 },

        /* ---------- 十 ---------- */
        { text: '', pause: 1500 },
        { text: '十', pause: 2500, big: true },

        { text: '秀兰第二次来，是第二年春天', pause: 1800 },

        { text: '她带着大儿子，十三岁', pause: 1500 },
        { text: '她让儿子在工地门口举着一块纸板', pause: 1500 },
        { text: '上面写着：', pause: 1000 },
        { text: '「陈广志，安徽阜阳，1989年9月失踪。」', pause: 2800 },

        { text: '', pause: 800 },

        { text: '工地的人出来赶他们', pause: 1500 },
        { text: '纸板被撕了', pause: 1200 },
        { text: '她儿子被推倒在地上', pause: 1500 },
        { text: '膝盖磕破了', pause: 1500 },

        { text: '', pause: 800 },

        { text: '有个工人偷偷塞给她五十块钱', pause: 1800 },
        { text: '说：', pause: 800 },
        { text: '「嫂子，你回去吧。」', pause: 1500 },
        { text: '「你男人不是那种会跑的人。」', pause: 1500 },
        { text: '「但是……你别找了。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '秀兰问：', pause: 800 },
        { text: '「为什么？」', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '那个工人没说话', pause: 1200 },
        { text: '摇摇头走了', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '她带着儿子回去了', pause: 2500 },

        /* ---------- 十一 ---------- */
        { text: '', pause: 1500 },
        { text: '十一', pause: 2500, big: true },

        { text: '秀兰第三次来，是第三年', pause: 1800 },

        { text: '她没去工地', pause: 1200 },
        { text: '她去了市里', pause: 1200 },
        { text: '她找到一个部门', pause: 1200 },
        { text: '说了情况', pause: 1000 },
        { text: '接待她的人很客气，说：', pause: 1200 },
        { text: '「我们帮你查。」', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '查了一个月', pause: 1500 },

        { text: '', pause: 800 },

        { text: '回复她：', pause: 1000 },
        { text: '「经查，陈广志于1989年9月自行离开工地，」', pause: 1500 },
        { text: '「去向不明。」', pause: 1200 },
        { text: '「无证据表明存在违法犯罪行为。」', pause: 2800 },

        { text: '', pause: 1000 },

        { text: '她拿着那张纸', pause: 1200 },
        { text: '站在市政府门口', pause: 1200 },
        { text: '站了很久', pause: 2400 },

        { text: '', pause: 1200 },

        { text: '然后她回了安徽', pause: 2500 },

        { text: '', pause: 1200 },

        { text: '从那以后', pause: 1200 },
        { text: '她再也没有来过临江', pause: 3000 },

        /* ---------- 十二 ---------- */
        { text: '', pause: 1500 },
        { text: '十二', pause: 2500, big: true },

        { text: '2020年，老厂区改造', pause: 1800 },

        { text: '施工队挖地基', pause: 1200 },
        { text: '在原来的47号桩位置', pause: 1200 },
        { text: '挖出了一具遗骨', pause: 1500 },
        { text: '旁边有一块蓝色的确良布', pause: 1200 },
        { text: '烂了一半', pause: 1000 },
        { text: '还有一个搪瓷杯', pause: 1200 },
        { text: '上面印着「先进工作者」', pause: 2400 },

        { text: '', pause: 1000 },

        { text: '警方立案', pause: 1200 },
        { text: '查了三个月', pause: 1500 },

        { text: '', pause: 800 },

        { text: '当年的建筑公司，2003年注销了', pause: 1800 },
        { text: '法人代表刘德胜，2010年死于肝癌', pause: 2000 },

        { text: '', pause: 800 },

        { text: '当年的工头赵大勇，2016年死于脑梗', pause: 2000 },

        { text: '', pause: 800 },

        { text: '当年的技术员孙志强', pause: 1200 },
        { text: '退休了，在海南', pause: 1200 },
        { text: '警察打电话问他', pause: 1200 },
        { text: '他说：', pause: 800 },
        { text: '「时间太久了，记不清了。」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '当年和陈广志一个工棚的工人', pause: 1500 },
        { text: '能找到的只有三个', pause: 1200 },
        { text: '一个在老家种地', pause: 1200 },
        { text: '一个在广东打工', pause: 1200 },
        { text: '一个已经去世了', pause: 1500 },

        { text: '', pause: 800 },

        { text: '种地的那个说：', pause: 1200 },
        { text: '「陈广志？哦，那个闷葫芦。」', pause: 1500 },
        { text: '「他怎么了？不知道，他早就不干了。」', pause: 2200 },

        { text: '', pause: 800 },

        { text: '广东那个说：', pause: 1200 },
        { text: '「记不清了，那么多人。」', pause: 2200 },

        { text: '', pause: 1000 },

        { text: '没有人记得他', pause: 3000 },

        { text: '', pause: 1200 },

        { text: '案件转入未破命案档案库', pause: 1800 },
        { text: '遗骸火化', pause: 1200 },
        { text: '骨灰编号：2020-临-0783', pause: 2000 },
        { text: '无亲属认领', pause: 3000 }
                ,

        /* ---------- 十三 ---------- */
        { text: '', pause: 1500 },
        { text: '十三', pause: 2500, big: true },

        { text: '2021年，秀兰来了', pause: 1800 },

        { text: '她七十三岁', pause: 1200 },
        { text: '她坐硬座来的', pause: 1200 },
        { text: '她找到殡仪馆，说：', pause: 1200 },
        { text: '「2020年发现的那具遗骨，可能是我男人。」', pause: 2800 },

        { text: '', pause: 800 },

        { text: '工作人员查了编号，说：', pause: 1200 },
        { text: '「有。但是需要您提供亲属关系证明。」', pause: 2500 },

        { text: '', pause: 800 },

        { text: '秀兰说：', pause: 800 },
        { text: '「我是他老婆。」', pause: 1800 },

        { text: '', pause: 800 },

        { text: '工作人员说：', pause: 800 },
        { text: '「结婚证呢？」', pause: 1800 },

        { text: '', pause: 800 },

        { text: '秀兰说：', pause: 800 },
        { text: '「我们那时候没领证。」', pause: 2200 },

        { text: '', pause: 800 },

        { text: '工作人员说：', pause: 800 },
        { text: '「户口本呢？」', pause: 1800 },

        { text: '', pause: 800 },

        { text: '秀兰说：', pause: 800 },
        { text: '「他出来打工之前户口在村里，」', pause: 1500 },
        { text: '「后来村里合并，档案没了。」', pause: 2200 },

        { text: '', pause: 800 },

        { text: '工作人员说：', pause: 800 },
        { text: '「那……您有没有其他能证明的材料？」', pause: 2400 },

        { text: '', pause: 800 },

        { text: '秀兰说：', pause: 800 },
        { text: '「都没有。」', pause: 2200 },

        { text: '', pause: 1000 },

        { text: '工作人员很为难：', pause: 1200 },
        { text: '「阿姨，这个……我们也没办法。」', pause: 1500 },
        { text: '「没有证明，我们不能把遗骨给您。」', pause: 2800 },

        { text: '', pause: 1200 },

        { text: '秀兰站在殡仪馆大厅里', pause: 1500 },
        { text: '站了一上午', pause: 2000 },

        { text: '', pause: 1200 },

        { text: '下午，她走了', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '临走之前', pause: 1200 },
        { text: '她跟工作人员说了一句话：', pause: 1500 },

        { text: '', pause: 1500 },

        { text: '「他活着的时候，没人认他。」', pause: 2200 },
        { text: '「死了也没人认他。」', pause: 2200 },
        { text: '「那我这三十多年，算什么？」', pause: 4000 },

        { text: '', pause: 1500 },

        { text: '工作人员没回答', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '她回了安徽', pause: 2500 },

        /* ---------- 十四 ---------- */
        { text: '', pause: 1500 },
        { text: '十四', pause: 2500, big: true },

        { text: '陈建军今年四十五岁', pause: 1500 },
        { text: '在南方一个城市，做小包工头', pause: 1800 },

        { text: '', pause: 800 },

        { text: '你找到他，跟他说了这件事', pause: 1500 },
        { text: '他听完，沉默了很久', pause: 2000 },

        { text: '', pause: 1000 },

        { text: '然后他说：', pause: 1000 },

        { text: '', pause: 600 },

        { text: '「我知道。」', pause: 2000 },

        { text: '', pause: 600 },

        { text: '「我妈走之前跟我说过，」', pause: 1500 },
        { text: '「她最后一次去临江，人家要她拿证明。」', pause: 1800 },
        { text: '「她拿不出来。」', pause: 1500 },
        { text: '「她说她那天站在殡仪馆门口，」', pause: 1500 },
        { text: '「觉得自己像个要饭的。」', pause: 2800 },

        { text: '', pause: 1000 },

        { text: '「我妈是2022年走的。」', pause: 1800 },
        { text: '「走之前跟我说了一句话——」', pause: 2000 },

        { text: '', pause: 800 },

        { text: '「你爹的事，你别管了。」', pause: 2000 },
        { text: '「你管不了。」', pause: 3000 },

        { text: '', pause: 1200 },

        { text: '「我现在也是包工头。」', pause: 1500 },
        { text: '「我手底下有三十多个工人。」', pause: 1500 },
        { text: '「每年过年，我都盯着甲方把工钱结清。」', pause: 1800 },
        { text: '「我不欠工人一分钱。」', pause: 2500 },

        { text: '', pause: 1000 },

        { text: '「但是我不会去翻我爸的案子。」', pause: 1800 },
        { text: '「翻不动。」', pause: 1500 },
        { text: '「我还有老婆孩子。」', pause: 2200 },

        { text: '', pause: 1000 },

        { text: '「你要是写，就写吧。」', pause: 1800 },
        { text: '「写完了，别找我。」', pause: 2500 },

        { text: '', pause: 1200 },

        { text: '他挂了电话', pause: 2500 },

        /* ---------- 十五 ---------- */
        { text: '', pause: 1500 },
        { text: '十五', pause: 2500, big: true },

        { text: '陈广志这辈子', pause: 1500 },
        { text: '没有照片', pause: 1500 },
        { text: '没有遗物', pause: 1500 },
        { text: '没有坟墓', pause: 2500 },

        { text: '', pause: 1200 },

        { text: '他留下的只有一串数字：', pause: 1800 },
        { text: '2020-临-0783', pause: 3000, num: true },

        { text: '', pause: 1500 },

        { text: '他的妻子叫秀兰', pause: 1800 },
        { text: '他的儿子叫建军', pause: 1800 },
        { text: '他的女儿叫大丫', pause: 2200 },

        { text: '', pause: 1200 },

        { text: '他们都还活着', pause: 2000 },
        { text: '但他们再也没有提起过他', pause: 2800 },

        { text: '', pause: 1500 },

        { text: '不是忘了他', pause: 2000 },
        { text: '是提起他，太疼了', pause: 5000 }
    ]
};