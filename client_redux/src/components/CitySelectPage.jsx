/**
 * 城市选择页
 * 在【酒店列表页】的搜索框点击【城市】后，进入该页面
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildHotelListQuery } from '../utils/hotelQuery';
import { SearchOutlined } from '@ant-design/icons';

export default function CitySelectPage() {
  const navigate = useNavigate();

  // 模拟热门城市数据
  const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都'];

  // 城市分组数据
  const cityGroups = {
    A: [
      '阿尔山市',
      '阿克苏市',
      '阿拉尔市',
      '阿拉山口市',
      '阿勒泰市',
      '安宁市',
      '安丘市',
      '安顺市',
      '安陆市',
      '安庆市',
      '安阳市',
      '鞍山市',
    ],
    B: [
      '白城市',
      '白山市',
      '白银市',
      '白杨市',
      '百色市',
      '霸州市',
      '蚌埠市',
      '包头市',
      '巴彦淖尔市',
      '巴中市',
      '宝鸡市',
      '保定市',
      '保山市',
      '北海市',
      '北京市',
      '北安市',
      '北票市',
      '北镇市',
      '本溪市',
      '毕节市',
      '滨州市',
      '博乐市',
      '泊头市',
    ],
    C: [
      '沧州市',
      '苍溪市',
      '曹县市',
      '常德市',
      '常宁市',
      '常熟市',
      '常州市',
      '长春市',
      '长沙市',
      '长治市',
      '巢湖市',
      '朝阳区市',
      '朝阳市',
      '潮州市',
      '郴州市',
      '成都市',
      '承德市',
      '城固县市',
      '成山市',
      '赤壁市',
      '赤峰市',
      '崇左市',
      '滁州市',
      '楚雄市',
      '慈溪市',
      '从化区市',
      '重庆市',
    ],
    D: [
      '大安市',
      '大连市',
      '大庆市',
      '大同市',
      '大冶市',
      '达州市',
      '丹东市',
      '丹江口市',
      '丹阳市',
      '当阳市',
      '德惠市',
      '德令哈市',
      '德兴市',
      '德阳市',
      '邓州市',
      '登封市',
      '定西市',
      '定州市',
      '东港市',
      '东莞市',
      '东宁市',
      '东台市',
      '东兴市',
      '东阳市',
      '都江堰市',
      '都匀市',
      '敦化市',
      '敦煌市',
    ],
    E: ['鄂尔多斯市', '鄂州市', '恩平市', '恩施市'],
    F: [
      '防城港市',
      '房县市',
      '肥城市',
      '费县市',
      '汾阳市',
      '丰城市',
      '丰镇市',
      '凤城市',
      '奉化市',
      '佛山市',
      '福安市',
      '福清市',
      '福泉市',
      '福州市',
      '抚顺市',
      '抚州市',
      '阜康市',
      '阜新市',
      '阜阳市',
      '富锦市',
      '富阳市',
    ],
    G: [
      '盖州市',
      '甘孜市',
      '赣州市',
      '高碑店市',
      '高平市',
      '高密市',
      '高安市',
      '高邮市',
      '高州市',
      '格尔木市',
      '个旧市',
      '根河市',
      '公主岭市',
      '巩义市',
      '古交市',
      '广安市',
      '广德市',
      '广汉市',
      '广水市',
      '广州市',
      '贵池区市',
      '贵港市',
      '贵溪市',
      '贵阳市',
      '桂林市',
      '固原市',
    ],
    H: [
      '哈尔滨市',
      '海城市',
      '海口市',
      '海林市',
      '海伦市',
      '海门市',
      '海宁市',
      '海阳市',
      '海东市',
      '邯郸市',
      '韩城市',
      '哈密市',
      '汉川市',
      '杭州市',
      '和龙市',
      '和田市',
      '河津市',
      '河间市',
      '河源市',
      '菏泽市',
      '贺州市',
      '鹤壁市',
      '鹤岗市',
      '鹤山市',
      '黑河市',
      '衡水市',
      '衡阳市',
      '洪湖市',
      '洪江市',
      '侯马市',
      '呼和浩特市',
      '呼伦贝尔市',
      '葫芦岛市',
      '虎林市',
      '华阴市',
      '华蓥市',
      '化州市',
      '淮安市',
      '淮北市',
      '淮南市',
      '黄冈市',
      '黄骅市',
      '黄山市',
      '黄石市',
      '珲春市',
      '辉县市',
      '惠州市',
      '霍林郭勒市',
      '霍州市',
    ],
    J: [
      '济南市',
      '济宁市',
      '济源市',
      '即墨区市',
      '鸡西市',
      '吉安市',
      '吉林市',
      '吉首市',
      '集安市',
      '嘉兴市',
      '嘉峪关市',
      '简阳市',
      '建德市',
      '建瓯市',
      '建阳市',
      '监利市',
      '江门市',
      '江山市',
      '江阴市',
      '江油市',
      '焦作市',
      '胶州市',
      '蛟河市',
      '介休市',
      '界首市',
      '金昌市',
      '金华市',
      '金坛区市',
      '津市市',
      '锦州市',
      '晋城市',
      '晋江市',
      '晋中市',
      '荆门市',
      '荆州市',
      '井冈山市',
      '景德镇市',
      '景洪市',
      '靖江市',
      '九江市',
      '酒泉市',
      '句容市',
    ],
    K: [
      '开封市',
      '开远市',
      '开原市',
      '凯里市',
      '康定市',
      '克拉玛依市',
      '库尔勒市',
      '奎屯市',
      '昆明市',
      '昆山市',
    ],
    L: [
      '拉萨市',
      '来宾市',
      '莱芜市',
      '莱西市',
      '莱阳市',
      '莱州市',
      '涞源县市',
      '兰溪市',
      '兰州市',
      '廊坊市',
      '阆中市',
      '乐昌市',
      '乐陵市',
      '乐平市',
      '乐清市',
      '乐山市',
      '雷州市',
      '耒阳市',
      '冷水江市',
      '离石区市',
      '梨树县市',
      '醴陵市',
      '丽江市',
      '丽水市',
      '连云港市',
      '连州市',
      '涟源市',
      '聊城市',
      '临沧市',
      '临汾市',
      '临海市',
      '临江市',
      '临清市',
      '临夏市',
      '临沂市',
      '临湘市',
      '临安市',
      '灵宝市',
      '灵武市',
      '凌海市',
      '凌源市',
      '浏阳市',
      '柳州市',
      '六安市',
      '六盘水市',
      '龙海市',
      '龙井市',
      '龙口市',
      '龙泉市',
      '龙岩市',
      '龙南市',
      '隆昌市',
      '娄底市',
      '泸州市',
      '卢氏县市',
      '庐山市',
      '陆丰市',
      '鹿泉市',
      '禄丰市',
      '漯河市',
      '洛阳区市',
      '洛阳市',
      '溧阳市',
    ],
    M: [
      '麻城市',
      '马鞍山市',
      '满洲里市',
      '茂名市',
      '眉山市',
      '梅河口市',
      '梅州市',
      '蒙自市',
      '孟州市',
      '米林市',
      '密山市',
      '绵阳市',
      '绵竹市',
      '珉州市',
      '明光市',
      '漠河市',
      '牡丹江市',
      '穆棱市',
    ],
    N: [
      '内江市',
      '那曲市',
      '纳河市',
      '南昌市',
      '南充市',
      '南京市',
      '南宁市',
      '南平市',
      '南通市',
      '南雄市',
      '南阳市',
      '讷河市',
      '宁波市',
      '宁安市',
      '宁德市',
      '宁国市',
      '攀枝花市',
      '盘锦市',
      '彭州市',
      '蓬莱市',
      '邳州市',
      '平度市',
      '平顶山市',
      '平果市',
      '平湖市',
      '平凉市',
      '平泉市',
      '平遥县市',
      '萍乡市',
      '普洱市',
      '莆田市',
      '濮阳市',
    ],
    Q: [
      '七台河市',
      '栖霞市',
      '齐齐哈尔市',
      '祁阳市',
      '奇台县市',
      '启东市',
      '潜江市',
      '秦皇岛市',
      '沁阳市',
      '青岛市',
      '青州市',
      '青铜峡市',
      '清远市',
      '清镇市',
      '邛崃市',
      '琼海市',
      '衢州市',
      '曲阜市',
      '曲靖市',
      '泉州市',
      '确山县市',
    ],
    R: [
      '仁怀市',
      '任丘市',
      '日喀则市',
      '荣成市',
      '如皋市',
      '汝州市',
      '乳山市',
      '瑞安市',
      '瑞昌市',
      '瑞金市',
    ],
    S: [
      '三河市',
      '三门峡市',
      '三明市',
      '三沙市',
      '三亚市',
      '沙河市',
      '山南市',
      '汕头市',
      '汕尾市',
      '商丘市',
      '商洛市',
      '商州市',
      '上饶市',
      '尚志市',
      '韶关市',
      '邵武市',
      '邵阳市',
      '绍兴市',
      '射洪市',
      '深圳市',
      '深州市',
      '沈阳市',
      '十堰市',
      '石家庄市',
      '石河子市',
      '石狮市',
      '石首市',
      '石嘴山市',
      '双河市',
      '双辽市',
      '双鸭山市',
      '舒兰市',
      '朔州市',
      '四会市',
      '四平市',
      '松原市',
      '松滋市',
      '苏州市',
      '宿迁市',
      '宿州市',
      '绥芬河市',
      '绥化市',
      '随州市',
      '遂宁市',
    ],
    T: [
      '塔城市',
      '台山市',
      '台州市',
      '太仓市',
      '太原市',
      '泰安市',
      '泰兴市',
      '泰州市',
      '唐山市',
      '腾冲市',
      '天长市',
      '天门市',
      '天津市',
      '铁力市',
      '铁岭市',
      '通化市',
      '通辽市',
      '通什市',
      '同江市',
      '桐城市',
      '桐庐县市',
      '桐乡市',
      '铜川市',
      '铜陵市',
      '铜仁市',
      '图们市',
      '吐鲁番市',
      '屯昌县市',
    ],
    W: [
      '瓦房店市',
      '外方市',
      '乌兰察布市',
      '乌兰浩特市',
      '乌鲁木齐市',
      '乌苏市',
      '威海市',
      '潍坊市',
      '卫辉市',
      '温岭市',
      '温州市',
      '文山市',
      '闻喜县市',
      '翁牛特旗市',
      '瓮安县市',
      '涡阳县市',
      '无锡市',
      '吴川市',
      '吴忠市',
      '芜湖市',
      '梧州市',
      '五常市',
      '五大连池市',
      '五家渠市',
      '五指山市',
      '武安市',
      '武昌区市',
      '武冈市',
      '武功县市',
      '武汉市',
      '武威市',
      '舞钢市',
    ],
    X: [
      '西安市',
      '西昌市',
      '西宁市',
      '锡林浩特市',
      '厦门市',
      '仙桃市',
      '咸宁市',
      '咸阳市',
      '湘潭市',
      '湘乡市',
      '襄阳市',
      '项城市',
      '香港特别行政区',
      '孝感市',
      '孝义市',
      '忻州市',
      '辛集市',
      '新城市',
      '新乐市',
      '新密市',
      '新民市',
      '新泰市',
      '新乡市',
      '新沂市',
      '新余市',
      '新郑市',
      '信宜市',
      '信阳市',
      '兴城市',
      '兴化市',
      '兴宁市',
      '兴平市',
      '邢台市',
      '荥阳市',
      '雄安市',
      '徐闻县市',
      '徐州市',
      '许昌市',
      '宣城市',
      '宣威市',
      '旬阳市',
    ],
    Y: [
      '雅安市',
      '烟台市',
      '延安市',
      '延吉市',
      '盐城市',
      '扬中市',
      '扬州市',
      '阳春市',
      '阳江市',
      '阳泉市',
      '伊春市',
      '伊宁市',
      '仪征市',
      '宜宾市',
      '宜昌市',
      '宜城市',
      '宜春市',
      '宜兴市',
      '义乌市',
      '义马市',
      '益阳市',
      '银川市',
      '应城市',
      '英德市',
      '鹰潭市',
      '营口市',
      '永安市',
      '永城市',
      '永济市',
      '永康市',
      '永州市',
      '尤溪县市',
      '攸县市',
      '荥经县市',
      '荣昌区市',
      '容县市',
      '扎兰屯市',
      '扎赉特旗市',
      '张家港市',
      '张家界市',
      '张家口市',
      '张掖市',
      '漳平市',
      '漳州市',
      '樟树市',
      '长子县市',
      '招远市',
      '昭通市',
      '赵县市',
      '肇东市',
      '肇庆市',
      '调兵山市',
      '镇江市',
      '正定县市',
      '郑州市',
      '枝江市',
      '中山市',
      '中卫市',
      '钟祥市',
      '舟山市',
      '周口市',
      '周宁县市',
      '株洲市',
      '珠海市',
      '诸城市',
      '诸暨市',
      '驻马店市',
      '庄河市',
      '淄博市',
      '自贡市',
      '邹城市',
      '邹平市',
      '遵义市',
      '左权县市',
    ],
    Z: [
      '扎兰屯市',
      '张家港市',
      '张家界市',
      '张家口市',
      '张掖市',
      '漳平市',
      '漳州市',
      '樟树市',
      '招远市',
      '昭通市',
      '肇东市',
      '肇庆市',
      '调兵山市',
      '镇江市',
      '郑州市',
      '枝江市',
      '中山市',
      '中卫市',
      '钟祥市',
      '舟山市',
      '周口市',
      '株洲市',
      '珠海市',
      '诸城市',
      '诸暨市',
      '驻马店市',
      '庄河市',
      '淄博市',
      '自贡市',
      '邹城市',
      '邹平市',
      '遵义市',
    ],
  };

  // 用 ref 拿到滚动容器这个 DOM
  // ref 可以不触发重新渲染，一般用来存 DOM；
  // 而 state 会触发重新渲染，一般用来存 UI 数据
  const containerRef = useRef(null);
  // 用 ref 记录每个字母区域 DOM
  const letterRefs = useRef({});

  // 右侧索引目录高亮显示，默认显示【热门】
  // 因为这个是 UI 数据，需要高亮显示（渲染），所以用 state
  // react 思维：【状态变化】驱动【UI 变化】，所以后面 color: activeLetter === letter ? '#1890ff' : '#333'
  const [activeLetter, setActiveLetter] = useState('热门');

  const [searchParams] = useSearchParams();
  // 点击城市
  const handleSelectCity = (city) => {
    const currentQuery = {
      city,
      keyword: searchParams.get('keyword') || '',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      nights: searchParams.get('nights') || '',
    };

    const queryString = buildHotelListQuery(currentQuery);

    navigate(`/hotel-list?${queryString}`);
  };

  const scrollToLetter = (letter) => {
    const container = containerRef.current;
    const target = letterRefs.current[letter];

    if (container && target) {
      // 使用 requestAnimationFrame 确保在下一帧执行滚动，避免当前事件循环中的布局抖动
      requestAnimationFrame(() => {
        container.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth', // 如果需要平滑滚动
        });
      });

      // 延迟更新高亮，给滚动留出时间，避免重绘影响滚动终点
      setTimeout(() => {
        setActiveLetter(letter);
      }, 150); // 延迟稍长一点，确保滚动稳定
    }
  };

  // 手指滑动字母栏
  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;

    // document.elementsFromPoint(x, y) 返回：(x, y) 坐标下所有 DOM 元素
    // 这里获取的就是手指所在位置的所有 DOM 元素
    // 真实 DOM 命中检测，更稳定
    const elements = document.elementsFromPoint(window.innerWidth - 10, touchY);

    // 找到带 data-letter 的那个 span
    const letterEl = elements.find((el) => el.dataset?.letter);

    if (letterEl) {
      const letter = letterEl.dataset.letter;
      scrollToLetter(letter);
    }
  };

  // 使用 useEffect 监听滚动，自动高亮字母
  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = () => {
      // 获取容器当前的滚动位置（距离顶部的像素值）
      const scrollTop = container.scrollTop;

      // letterRefs.current 是一个对象，结构类似：{'A': <div>...城市列表A...</div>,...}
      // Object.keys 表示获取所有字母键名，如 ['A', 'B', 'C', ...]
      const letters = Object.keys(letterRefs.current);

      // 倒序遍历，因为想找到最后一个被滚动到顶部的区域
      // 如果正序的话，比如当前滚动到350，而A区域的高度为100，正序遍历到A，直接true高亮了
      for (let i = letters.length - 1; i >= 0; i--) {
        const letter = letters[i];
        // 获取当前字母对应的 DOM 区域
        const section = letterRefs.current[letter];

        // section.offsetTop 表示当前字母区域距离容器顶部的距离
        // 如果滚动位置超过了某个字母区域的顶部（包括容差，提前高亮）
        if (section && scrollTop >= section.offsetTop - 20) {
          setActiveLetter(letter);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      style={{
        height: '100vh', // 高度占满视口
        display: 'flex',
        flexDirection: 'column', // 使内部元素垂直排列
        background: '#fff',
      }}
    >
      {/* ================= 顶部搜索栏 ================= */}
      <div
        style={{
          display: 'flex', // flex 水平居中
          alignItems: 'center',
          padding: '10px 12px', // 内边距上下 10px，左右 12px
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        {/* ================= 搜索框 ================= */}
        <div
          style={{
            flex: 1, // 占据剩余空间
            display: 'flex',
            alignItems: 'center',
            background: '#f5f5f5',
            borderRadius: 20,
            padding: '9px 12px',
          }}
        >
          <SearchOutlined
            style={{
              fontSize: 16,
              marginRight: 6,
            }}
          />
          <input
            placeholder="城市/区域/位置"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 16,
              flex: 1,
            }}
          />
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginLeft: 12,
            background: 'none',
            border: 'none',
            fontSize: 16,
            color: '#333',
          }}
        >
          取消
        </button>
      </div>

      {/* ================= toggle ================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around', // 水平均匀分布
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {['国内（含港澳台）', '海外', '热搜'].map((item, index) => (
          <span
            key={item}
            style={{
              padding: '12px 0',
              fontSize: 15,
              color: index === 0 ? '#1677ff' : '#333',
              fontWeight: index === 0 ? 'bold' : 'normal',
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* ================= 主体区域 ================= */}
      <div
        style={{
          flex: 1, // 占据剩余垂直空间（flex:1）
          display: 'flex', // 内部 flex 行布局
          overflow: 'hidden', // 溢出隐藏，使左右两列可独立滚动
        }}
      >
        {/* ================= 左侧滚动区域 ================= */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 12px',
            position: 'relative', // 添加这一行
          }}
        >
          {/* ===== 国内热门城市 ===== */}
          <div style={{ paddingTop: 12 }}>
            <div
              ref={(el) => (letterRefs.current['热门'] = el)}
              style={{
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              国内热门城市
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: 20,
              }}
            >
              {hotCities.map((city) => (
                <div
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  style={{
                    textAlign: 'center',
                    padding: '8px 0',
                    background: '#f5f5f5',
                    borderRadius: 8,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          </div>

          {/* ===== 城市分组 ===== */}
          {Object.keys(cityGroups).map((letter) => (
            <div key={letter}>
              <div
                ref={(el) => (letterRefs.current[letter] = el)}
                style={{
                  position: 'sticky',
                  // top: 0,
                  background: '#fff',
                  fontWeight: 'bold',
                  padding: '6px 0',
                  fontSize: 14,
                  zIndex: 5,
                }}
              >
                {letter}
              </div>

              {cityGroups[letter].map((city) => (
                <div
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #f5f5f5',
                    fontSize: 14,
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ================= 右侧字母索引 ================= */}
        <div
          onTouchMove={handleTouchMove}
          style={{
            width: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 10,
            fontSize: 12,
            userSelect: 'none',
            background: '#fff',
          }}
        >
          {['热门', ...Object.keys(cityGroups)].map((letter) => (
            <span
              key={letter}
              data-letter={letter}
              onClick={() => scrollToLetter(letter)}
              style={{
                padding: '3px 0',
                color: activeLetter === letter ? '#1677ff' : '#333',
                fontWeight: activeLetter === letter ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
