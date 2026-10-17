// Chạy: node scripts/test-shelf-review.mjs   (BASE=http://localhost:3000/api mặc định)
const BASE = process.env.BASE ?? 'http://localhost:3000/api';
const WORK_ID = 'OL82563W';

let pass = 0;
let fail = 0;
function check(name, cond, extra = '') {
  if (cond) {
    pass++;
    console.log(`PASS  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name} ${extra}`);
  }
}

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

const patch = (id, body) => call('PATCH', `/shelf/${id}`, body);
const get = async (id) => (await call('GET', `/shelf/${id}`)).json;

function isErrorFormat(j) {
  return (
    j &&
    typeof j.statusCode === 'number' &&
    j.error &&
    j.message &&
    j.path &&
    j.timestamp
  );
}

async function expect400(name, id, body) {
  const before = await get(id);
  const r = await patch(id, body);
  const after = await get(id);
  check(`${name}: 400`, r.status === 400, `got ${r.status}`);
  check(`${name}: đúng định dạng lỗi`, isErrorFormat(r.json));
  check(
    `${name}: dữ liệu không đổi`,
    JSON.stringify(before) === JSON.stringify(after),
  );
}

// ---- chuẩn bị sách A ----
let r = await call('POST', '/shelf', { workId: WORK_ID });
let id;
if (r.status === 201) id = r.json.id;
else {
  const list = await call('GET', '/shelf');
  id = list.json.find((b) => b.workId === WORK_ID).id;
}
console.log(`Sách A id=${id}`);

// đưa về trạng thái sạch
await patch(id, { status: 'WANT_TO_READ', rating: null, note: null });
let b = await get(id);
check('khởi tạo: rating null, note null', b.rating === null && b.note === null);

// ---- rating hợp lệ ----
r = await patch(id, { rating: 4 });
check('rating=4: 200', r.status === 200);
check('rating=4: lưu đúng', r.json.rating === 4);
check('rating=4: status không đổi', r.json.status === 'WANT_TO_READ');
check('rating ở WANT_TO_READ được phép (quyết định e)', r.json.rating === 4);

for (const v of [1, 5]) {
  r = await patch(id, { rating: v });
  check(`rating=${v} (biên): 200`, r.status === 200 && r.json.rating === v);
}

// ---- note ----
r = await patch(id, { note: 'abc' });
check('note=abc: 200', r.status === 200 && r.json.note === 'abc');
check('note=abc: rating giữ nguyên', r.json.rating === 5);

// ---- null xóa ----
r = await patch(id, { rating: null });
check('rating=null: xóa', r.status === 200 && r.json.rating === null);
check('rating=null: note giữ nguyên', r.json.note === 'abc');

r = await patch(id, { note: null });
check('note=null: xóa', r.status === 200 && r.json.note === null);

await patch(id, { note: 'xyz' });
r = await patch(id, { note: '' });
check('note="": xóa (null)', r.status === 200 && r.json.note === null);

// ---- (f) khoảng trắng ----
r = await patch(id, { note: '   Hay   ' });
check('note có khoảng trắng đầu cuối: được trim', r.json.note === 'Hay');

await patch(id, { note: 'xyz' });
r = await patch(id, { note: '     ' });
check('note toàn dấu cách: coi là rỗng -> null', r.status === 200 && r.json.note === null);

// ---- độ dài note ----
r = await patch(id, { note: 'a'.repeat(500) });
check('note đúng 500 ký tự: 200', r.status === 200 && r.json.note.length === 500);
await expect400('note 501 ký tự', id, { note: 'a'.repeat(501) });
r = await patch(id, { note: ' ' + 'a'.repeat(500) + ' ' });
check('note 500 ký tự + khoảng trắng hai đầu: trim rồi mới đếm -> 200', r.status === 200);

// ---- rating sai ----
await patch(id, { rating: 3 });
for (const v of [0, 6, -1, 3.5, '3', 'abc', true]) {
  await expect400(`rating=${JSON.stringify(v)}`, id, { rating: v });
}
await expect400('note sai kiểu (số)', id, { note: 123 });

// ---- gửi cùng lúc với status ----
r = await patch(id, { rating: 5, status: 'READING' });
check('rating + status: 200', r.status === 200);
check('rating + status: cả hai được áp dụng', r.json.rating === 5 && r.json.status === 'READING');

r = await patch(id, { rating: 2, note: 'hai trường', currentPage: 3 });
check(
  'rating + note + currentPage: tất cả áp dụng',
  r.json.rating === 2 && r.json.note === 'hai trường' && r.json.currentPage === 3,
);

// ---- body rỗng / chỉ null ở currentPage, status vẫn 400 ----
await expect400('body rỗng', id, {});
await expect400('chỉ status=null', id, { status: null });
await expect400('chỉ currentPage=null', id, { currentPage: null });

// ---- Hồi quy: rating/note không bị ảnh hưởng bởi status/currentPage ----
r = await patch(id, { status: 'FINISHED' });
check('đổi status: rating/note giữ nguyên', r.json.rating === 2 && r.json.note === 'hai trường');

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
