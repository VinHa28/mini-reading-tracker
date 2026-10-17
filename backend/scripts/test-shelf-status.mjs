// Chạy: node scripts/test-shelf-status.mjs   (BASE=http://localhost:3000/api mặc định)
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
const T = (await get(id)).totalPages;
console.log(`Sách A id=${id}, totalPages=${T}`);
if (!T || T < 3) {
  console.log('Cần sách có totalPages >= 3 để chạy test này');
  process.exit(1);
}

// đưa về trạng thái xuất phát
await patch(id, { status: 'WANT_TO_READ' });
await patch(id, { status: 'READING' });

// ---- 1. READING: startedAt có, finishedAt null ----
let b = await get(id);
check('READING: status', b.status === 'READING');
check('READING: startedAt đã gán', b.startedAt !== null);
check('READING: finishedAt null', b.finishedAt === null);
const startedAt = b.startedAt;

// ---- 2. status trùng hiện tại: no-op ----
const beforeNoop = await get(id);
r = await patch(id, { status: 'READING' });
check('no-op: 200', r.status === 200);
check(
  'no-op: startedAt/finishedAt/updatedAt không đổi',
  r.json.startedAt === beforeNoop.startedAt &&
    r.json.finishedAt === beforeNoop.finishedAt &&
    r.json.updatedAt === beforeNoop.updatedAt,
);

// ---- 3. FINISHED chỉ gửi status: tự điền trang cuối ----
r = await patch(id, { status: 'FINISHED' });
check('FINISHED: 200', r.status === 200);
check('FINISHED: status', r.json.status === 'FINISHED');
check('FINISHED: finishedAt đã gán', r.json.finishedAt !== null);
check('FINISHED: currentPage = totalPages', r.json.currentPage === T);
check('FINISHED: startedAt giữ nguyên', r.json.startedAt === startedAt);

// ---- 4. FINISHED -> READING ----
r = await patch(id, { status: 'READING' });
check('FINISHED->READING: status', r.json.status === 'READING');
check('FINISHED->READING: finishedAt null', r.json.finishedAt === null);
check('FINISHED->READING: startedAt giữ nguyên', r.json.startedAt === startedAt);

// ---- 5. READING + currentPage hợp lệ ----
r = await patch(id, { status: 'READING', currentPage: 2 });
check('READING+page=2: status READING', r.json.status === 'READING');
check('READING+page=2: currentPage = 2', r.json.currentPage === 2);

// ---- 6. -> WANT_TO_READ: giữ nguyên (quyết định c) ----
r = await patch(id, { status: 'WANT_TO_READ' });
check('->WANT_TO_READ: status', r.json.status === 'WANT_TO_READ');
check('->WANT_TO_READ: giữ currentPage', r.json.currentPage === 2);
check('->WANT_TO_READ: giữ startedAt', r.json.startedAt === startedAt);

// ---- 7. Ca E: WANT_TO_READ + currentPage > 0, status không bị tự chuyển ----
r = await patch(id, { status: 'WANT_TO_READ', currentPage: 1 });
check('Ca E: 200', r.status === 200);
check('Ca E: vẫn WANT_TO_READ', r.json.status === 'WANT_TO_READ');
check('Ca E: currentPage = 1', r.json.currentPage === 1);

// ---- 8. Chỉ gửi currentPage > 0 trên WANT_TO_READ: tự sang READING (rule T2) ----
r = await patch(id, { currentPage: 2 });
check('Chỉ currentPage: tự sang READING', r.json.status === 'READING');

// ---- 9. Ca B: READING + currentPage = total -> FINISHED ----
r = await patch(id, { status: 'READING', currentPage: T });
check('Ca B: 200', r.status === 200);
check('Ca B: thành FINISHED', r.json.status === 'FINISHED');
check('Ca B: finishedAt đã gán', r.json.finishedAt !== null);

// ---- 10. FINISHED + currentPage = total: hợp lệ ----
r = await patch(id, { status: 'FINISHED', currentPage: T });
check('FINISHED+page=total: 200', r.status === 200 && r.json.status === 'FINISHED');

// ---- 11. Chỉ lùi currentPage khi FINISHED -> READING (rule T2) ----
r = await patch(id, { currentPage: T - 1 });
check('Lùi trang: về READING', r.json.status === 'READING');
check('Lùi trang: finishedAt null', r.json.finishedAt === null);

// ---- 12. Các ca 400 ----
await expect400('Ca C (FINISHED + page<total)', id, {
  status: 'FINISHED',
  currentPage: 1,
});
await expect400('body rỗng', id, {});
await expect400('status null', id, { status: null });
await expect400('status sai giá trị', id, { status: 'DONE' });
await expect400('currentPage > total', id, { currentPage: T + 1 });
await expect400('trường lạ', id, { foo: 1 });
await expect400('status sai kiểu', id, { status: 123 });

// ---- 13. id ----
r = await patch(999999, { status: 'READING' });
check('id không tồn tại: 404', r.status === 404);
r = await patch('abc', { status: 'READING' });
check('id=abc: 400', r.status === 400);

// ---- Ghi chú ----
console.log(
  'Chưa test: sách totalPages = null chuyển FINISHED (khó tìm sách như vậy trên Open Library); logic được cover ở unit test T8.',
);

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
