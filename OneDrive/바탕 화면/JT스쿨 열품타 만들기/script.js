// 전역 변수
let sessions = [];
let studyData = {};
let dailyGoal = 0;
let subjects = [];
let subjectTimers = {};
let activeSubjectId = null;
let subjectTimersInterval = null;
let currentUser = null;
let lastDateCheck = null;
let dateCheckInterval = null;

// 사용자 데이터 파일명
const USER_DATA_FILE = 'jt_school_users.json';
const STUDY_DATA_FILE = 'jt_school_study_data.json';

// 로컬 데이터베이스 함수들

// DOM 요소들
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const nav = document.querySelector('.nav');

// 초기화 - 완벽한 모바일 지원
document.addEventListener('DOMContentLoaded', function() {
    setupLoginSystem();
    setupDateCheck();
    
    // 모바일 메뉴 토글 - 완벽한 이벤트 리스너 관리
    if (mobileMenuToggle) {
                mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        mobileMenuToggle.addEventListener('touchstart', toggleMobileMenu);
    }
    
    // 모바일 메뉴 외부 클릭 시 닫기 - 완벽한 이벤트 관리
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('touchstart', handleOutsideClick);
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    
    // ESC 키로 모바일 메뉴 닫기 - 완벽한 이벤트 관리
    document.removeEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleEscapeKey);

    // 모바일 최적화 설정
    setupMobileOptimization();
    setupMobileKeyboard();
    setupOrientationChange();
    setupMobilePerformance();
    
    // 모바일 메뉴 상태 복구
    restoreMobileMenuState();
    
    console.log('모바일 완벽 지원 초기화 완료');
});

// ESC 키 처리 함수 - 완벽한 버전
function handleEscapeKey(e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('show')) {
        closeMobileMenu();
    }
}

// 로그인 시스템 설정
function setupLoginSystem() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    // 저장된 사용자 정보 확인
    const savedUser = localStorage.getItem('jtSchoolUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadUserData();
        showMainContent();
        return;
    }
    
    // 폼 전환 이벤트
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchToRegisterForm();
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchToLoginForm();
        });
    }
    
    // 로그인 폼 제출 이벤트
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // 회원가입 폼 제출 이벤트
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
    
    // 디버깅 버튼 이벤트
    const debugUsersBtn = document.getElementById('debug-users');
    if (debugUsersBtn) {
        debugUsersBtn.addEventListener('click', function() {
            const users = loadUsers();
            console.log('현재 저장된 사용자 목록:', users);
            alert(`현재 저장된 사용자 수: ${users.length}\n사용자명들: ${users.map(u => u.username).join(', ')}`);
        });
    }
}

// 폼 전환 함수들
function switchToRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) loginForm.classList.remove('active');
    if (registerForm) registerForm.classList.add('active');
}

function switchToLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) registerForm.classList.remove('active');
    if (loginForm) loginForm.classList.add('active');
}

// 로그인 처리
function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    console.log('로그인 시도:', { username, password: password ? '***' : '비어있음' });
    
    if (!username || !password) {
        showToast('사용자명과 비밀번호를 입력해주세요.', 'error');
        return;
    }
    
    // 사용자 데이터에서 사용자 정보 확인
    const users = loadUsers();
    console.log('전체 사용자 목록:', users);
    
    // 먼저 사용자명이 존재하는지 확인
    const user = users.find(u => u.username === username);
    console.log('찾은 사용자:', user);
    
    if (!user) {
        showToast('사용자명과 비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    // 비밀번호 확인
    if (user.password !== password) {
        showToast('사용자명과 비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    // 로그인 성공
    currentUser = { id: user.id, username: user.username };
    console.log('로그인 성공:', currentUser);
    
    // 사용자 정보 저장
    localStorage.setItem('jtSchoolUser', JSON.stringify(currentUser));
    
    // 사용자 데이터 로드
    loadUserData();
    
    showMainContent();
    showToast(`${currentUser.username}님, JT SCHOOL에 오신 것을 환영합니다! 🎉`, 'success');
}

// 회원가입 처리
function handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    console.log('회원가입 시도:', { username, password: password ? '***' : '비어있음', confirmPassword: confirmPassword ? '***' : '비어있음' });
    
    // 입력값 검증
    if (!username) {
        showToast('사용자명을 입력해주세요.', 'error');
        return;
    }
    
    if (!password) {
        showToast('비밀번호를 입력해주세요.', 'error');
        return;
    }
    
    if (!confirmPassword) {
        showToast('비밀번호 확인을 입력해주세요.', 'error');
        return;
    }
    
    if (username.length < 3) {
        showToast('사용자명은 최소 3자 이상이어야 합니다.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('비밀번호가 일치하지 않습니다. 다시 확인해주세요.', 'error');
        return;
    }
    
    // 사용자명에 특수문자나 공백이 있는지 확인
    if (!/^[a-zA-Z0-9가-힣_]+$/.test(username)) {
        showToast('사용자명에는 영문, 숫자, 한글, 언더스코어(_)만 사용할 수 있습니다.', 'error');
        return;
    }
    
    // 새 사용자 생성 (사용자명 중복 허용)
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    console.log('새 사용자 생성:', newUser);
    
    const users = loadUsers();
    users.push(newUser);
    saveUsers(users);
    
    // 사용자별 학습 데이터 파일 생성
    createUserStudyData(newUser.id);
    
    showToast('회원가입이 완료되었습니다! 로그인해주세요.', 'success');
    switchToLoginForm();
    
    // 입력 필드 초기화
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm-password').value = '';
}

// 사용자 데이터 로드
function loadUserData() {
    if (!currentUser) return;
    
    const userData = loadUserStudyData(currentUser.id);
    if (userData) {
        subjects = userData.subjects || [];
        sessions = userData.sessions || [];
        dailyGoal = userData.dailyGoal || 0;
        
        // 과목별 타이머 데이터 로드 (저장된 데이터가 있으면 사용)
        if (userData.subjectTimers) {
            subjectTimers = userData.subjectTimers;
        } else {
            // 기존 과목들의 타이머 초기화
            subjectTimers = {};
            subjects.forEach(subject => {
                subjectTimers[subject.name] = 0;
            });
        }
        
        console.log('사용자 데이터 로드 완료:', {
            subjects: subjects.length,
            sessions: sessions.length,
            dailyGoal,
            subjectTimers
        });
    }
}

// 사용자 목록 로드
function loadUsers() {
    try {
        const data = localStorage.getItem(USER_DATA_FILE);
        const users = data ? JSON.parse(data) : [];
        console.log('로드된 사용자 목록:', users);
        return users;
    } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        return [];
    }
}

// 사용자 목록 저장
function saveUsers(users) {
    try {
        localStorage.setItem(USER_DATA_FILE, JSON.stringify(users, null, 2));
        console.log('사용자 목록 저장 완료:', users);
    } catch (error) {
        console.error('사용자 데이터 저장 실패:', error);
    }
}

// 사용자별 학습 데이터 로드
function loadUserStudyData(userId) {
    try {
        const key = `${STUDY_DATA_FILE}_${userId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : { subjects: [], sessions: [], dailyGoal: 0 };
    } catch (error) {
        console.error('학습 데이터 로드 실패:', error);
        return { subjects: [], sessions: [], dailyGoal: 0 };
    }
}

// 사용자별 학습 데이터 저장
function saveUserStudyData(userId, data) {
    try {
        // subjectTimers 데이터도 함께 저장
        const dataToSave = {
            ...data,
            subjectTimers: subjectTimers,
            lastUpdated: new Date().toISOString()
        };
        
        const key = `${STUDY_DATA_FILE}_${userId}`;
        localStorage.setItem(key, JSON.stringify(dataToSave, null, 2));
        
        console.log('학습 데이터 저장 완료:', dataToSave);
    } catch (error) {
        console.error('학습 데이터 저장 실패:', error);
    }
}

// 새 사용자의 학습 데이터 파일 생성
function createUserStudyData(userId) {
    const initialData = {
        subjects: [],
        sessions: [],
        dailyGoal: 0,
        subjectTimers: {},
        createdAt: new Date().toISOString()
    };
    saveUserStudyData(userId, initialData);
}

// 메인 화면 표시
function showMainContent() {
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    
    // 메인 앱 초기화
    loadData();
    setupEventListeners();
    setupTabNavigation();
    setupChatBot();
    setupSettings();
    setupDailyGoal();
    updateStats();
    updateSubjectTimers();
    updateTotalStudyTime();
    renderTagHeatmaps();
    renderSubjectHeatmaps();
}

// 날짜 체크 시스템 설정
function setupDateCheck() {
    // 마지막 날짜 체크 시간 저장 - ISO 문자열로 통일
    const now = new Date();
    lastDateCheck = now.toISOString().split('T')[0];
    localStorage.setItem('jtSchoolLastDateCheck', lastDateCheck);
    
    // 1분마다 날짜 변경 확인
    dateCheckInterval = setInterval(checkDateChange, 60000);
    
    // 앱 시작 시에도 날짜 변경 확인
    checkDateChange();
}

// 날짜 변경 확인
function checkDateChange() {
    const currentDate = new Date().toISOString().split('T')[0];
    const savedLastDate = localStorage.getItem('jtSchoolLastDateCheck');
    
    if (savedLastDate && savedLastDate !== currentDate) {
        // 날짜가 변경되었음
        handleDateChange(savedLastDate, currentDate);
    }
    
    // 현재 날짜 저장
    lastDateCheck = currentDate;
    localStorage.setItem('jtSchoolLastDateCheck', currentDate);
}

// 날짜 변경 처리
function handleDateChange(oldDate, newDate) {
    console.log(`날짜가 변경되었습니다: ${oldDate} → ${newDate}`);
    
    // 어제 날짜 계산 - 정확한 계산으로 수정
    const yesterday = new Date(oldDate);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // 현재 실행 중인 과목 타이머들을 어제 기록으로 저장
    if (activeSubjectId) {
        const subject = subjects.find(s => s.id == activeSubjectId);
        if (subject && subjectTimers[subject.name] > 0) {
            // 어제 세션에 추가
            const yesterdaySession = {
                id: Date.now(),
                subject: subject.name,
                tag: subject.tag,
                duration: subjectTimers[subject.name],
                date: yesterdayStr,
                startTime: new Date(yesterday.getTime() - (subjectTimers[subject.name] * 1000)).toISOString(),
                endTime: yesterday.toISOString()
            };
            
            sessions.push(yesterdaySession);
            
            // 과목별 총 시간 업데이트
            subject.totalTime += subjectTimers[subject.name];
            
            // 타이머 리셋
            subjectTimers[subject.name] = 0;
        }
        
        // 활성 타이머 중지
        if (subjectTimersInterval) {
            clearInterval(subjectTimersInterval);
            subjectTimersInterval = null;
        }
        activeSubjectId = null;
    }
    
    // 모든 과목 타이머를 어제 기록으로 저장
    subjects.forEach(subject => {
        if (subjectTimers[subject.name] > 0) {
            const yesterdaySession = {
                id: Date.now() + Math.random(),
                subject: subject.name,
                tag: subject.tag,
                duration: subjectTimers[subject.name],
                date: yesterdayStr,
                startTime: new Date(yesterday.getTime() - (subjectTimers[subject.name] * 1000)).toISOString(),
                endTime: yesterday.toISOString()
            };
            
            sessions.push(yesterdaySession);
            
            // 과목별 총 시간 업데이트
            subject.totalTime += subjectTimers[subject.name];
            
            // 타이머 리셋
            subjectTimers[subject.name] = 0;
        }
    });
    
    // 데이터 저장
    if (currentUser) {
        saveUserStudyData(currentUser.id, { subjects, sessions, dailyGoal });
    }
    
    // UI 업데이트
    updateStats();
    updateSubjectTimers();
    updateTotalStudyTime();
    renderTagHeatmaps();
    renderSubjectHeatmaps();
    
    // 사용자에게 알림
    showToast('새로운 하루가 시작되었습니다! 어제의 학습 기록이 저장되었습니다. 🌅', 'info');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 휴식 버튼
    const restBtn = document.getElementById('rest-btn');
    if (restBtn) {
        restBtn.addEventListener('click', pauseAllSubjectTimers);
    }
    
    // 과목 생성 버튼
    const createSubjectBtn = document.getElementById('create-subject-btn');
    if (createSubjectBtn) {
        createSubjectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            createNewSubject();
        });
    }
    
    // 과목 타이머 버튼들 (이벤트 위임)
    const subjectTimersContainer = document.getElementById('subject-timers');
    if (subjectTimersContainer) {
        subjectTimersContainer.addEventListener('click', function(e) {
            const target = e.target;
            
            if (target.classList.contains('subject-start-btn')) {
                const subjectId = target.getAttribute('data-subject-id');
                startSubjectTimer(subjectId);
            } else if (target.classList.contains('subject-pause-btn')) {
                const subjectId = target.getAttribute('data-subject-id');
                pauseSubjectTimer(subjectId);
            } else if (target.classList.contains('subject-reset-btn')) {
                const subjectId = target.getAttribute('data-subject-id');
                resetSubjectTimer(subjectId);
            } else if (target.classList.contains('subject-delete-btn')) {
                const subjectId = target.getAttribute('data-subject-id');
                deleteSubject(subjectId);
            }
        });
    }
}

// 새로운 과목 생성
function createNewSubject() {
    const nameInput = document.getElementById('new-subject-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        showToast('과목명을 입력해주세요.', 'error');
        return;
    }
    
    // 중복 과목명 확인
    if (subjects.some(subject => subject.name === name)) {
        showToast('이미 존재하는 과목명입니다.', 'error');
        return;
    }
    
    const newSubject = {
        id: Date.now(),
        name: name,
        totalTime: 0,
        createdAt: new Date().toISOString()
    };
    
    subjects.push(newSubject);
    
    // 새 과목의 타이머 초기화
    subjectTimers[name] = 0;
    
    // 데이터 저장
    saveUserStudyData(currentUser.id, { subjects, sessions, dailyGoal });
    
    // UI 업데이트
    updateSubjectList();
    updateSubjectTimers();
    
    // 입력 필드 초기화
    nameInput.value = '';
    
    showToast(`"${name}" 과목이 추가되었습니다! 📚`, 'success');
}

// 통계 업데이트
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.date === today);
    const todaySessionsTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    
    // 현재 실행 중인 과목들의 시간도 포함
    const todaySubjectTimersTotal = Object.values(subjectTimers).reduce((sum, time) => sum + time, 0);
    const totalToday = todaySessionsTotal + todaySubjectTimersTotal;
    
    // 오늘 합계 업데이트
    const todayTotalSpan = document.getElementById('today-total');
    if (todayTotalSpan) {
        todayTotalSpan.textContent = formatTime(totalToday);
    }
    
    // 주간/월간 통계 업데이트
    updateWeeklyMonthlyStats();
    
    // 일일 목표 진행률 업데이트
    updateDailyGoalProgress();
}

// 주간/월간 통계
function updateWeeklyMonthlyStats() {
    const now = new Date();
    const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const weeklySessions = sessions.filter(s => new Date(s.date) >= weekStart);
    const monthlySessions = sessions.filter(s => new Date(s.date) >= monthStart);
    
    const weeklySessionsTime = weeklySessions.reduce((sum, s) => sum + s.duration, 0);
    const monthlySessionsTime = monthlySessions.reduce((sum, s) => sum + s.duration, 0);
    
    // 현재 실행 중인 과목들의 시간도 포함
    const subjectTimersTotal = Object.values(subjectTimers).reduce((sum, time) => sum + time, 0);
    
    const weeklyTime = weeklySessionsTime + subjectTimersTotal;
    const monthlyTime = monthlySessionsTime + subjectTimersTotal;
    
    // 주간 합계 업데이트
    const weeklyTotalSpan = document.getElementById('weekly-total');
    if (weeklyTotalSpan) {
        weeklyTotalSpan.textContent = formatTime(weeklyTime);
    }
    
    // 기존 통계 업데이트
    const weeklyTimeElement = document.getElementById('weekly-time');
    const monthlyTimeElement = document.getElementById('monthly-time');
    const streakElement = document.getElementById('streak');
    
    if (weeklyTimeElement) {
        weeklyTimeElement.textContent = formatTime(weeklyTime);
    }
    if (monthlyTimeElement) {
        monthlyTimeElement.textContent = formatTime(monthlyTime);
    }
    
    // 연속 학습일 계산
    const streak = calculateStreak();
    if (streakElement) {
        streakElement.textContent = `${streak}일`;
    }
}

// 연속 학습일 계산
function calculateStreak() {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // 고유한 날짜만 추출하고 정렬
    const uniqueDates = [...new Set(sessions.map(s => s.date))].sort();
    
    if (uniqueDates.length === 0) return 0;
    
    // 가장 최근 날짜
    const latestDate = uniqueDates[uniqueDates.length - 1];
    
    // 오늘 학습했는지 확인
    const hasStudiedToday = latestDate === todayStr;
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // 오늘 학습하지 않았다면 어제부터 계산
    if (!hasStudiedToday) {
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // 연속된 날짜 계산
    for (let i = 0; i < 365; i++) { // 최대 1년
        const checkDate = new Date(currentDate);
        checkDate.setDate(currentDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (uniqueDates.includes(checkDateStr)) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// 시간 포맷팅
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}시간 ${minutes}분 ${secs}초`;
    } else if (minutes > 0) {
        return `${minutes}분 ${secs}초`;
    } else {
        return `${secs}초`;
    }
}

// 탭 네비게이션 설정
function setupTabNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

// 탭 전환 - 완벽한 모바일 최적화
function switchTab(tabName) {
    console.log('탭 전환 시도:', tabName);
    
    // 모든 탭 비활성화
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const targetSection = document.getElementById(tabName);
    
    if (!activeBtn || !targetSection) {
        console.error('탭 요소를 찾을 수 없습니다:', { tabName, activeBtn: !!activeBtn, targetSection: !!targetSection });
        return;
    }
    
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed', 'true');
    targetSection.classList.add('active');
    
    // 모바일에서 탭 전환 시 메뉴 닫기 및 스크롤 - 완벽한 버전
    if (window.innerWidth <= 768) {
        console.log('모바일에서 탭 전환, 메뉴 닫기');
        closeMobileMenu();
        
        // 해당 섹션으로 스크롤 - 모바일 호환성 완벽 보장
        setTimeout(() => {
            try {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetOffset = targetSection.offsetTop - headerHeight;
                
                // 모바일에서 smooth 스크롤 지원 여부 확인 및 대체 방안
                if ('scrollBehavior' in document.documentElement.style) {
                    window.scrollTo({
                        top: targetOffset,
                        behavior: 'smooth'
                    });
                } else {
                    // smooth 스크롤을 지원하지 않는 경우 즉시 이동
                    window.scrollTo(0, targetOffset);
                }
            } catch (error) {
                console.error('스크롤 오류:', error);
                // 스크롤 실패 시 단순히 맨 위로
                window.scrollTo(0, 0);
            }
        }, 300);
    }
    
    // 타임라인 탭인 경우 히트맵 업데이트
    if (tabName === 'timeline') {
        console.log('타임라인 탭 활성화, 히트맵 업데이트');
        renderTagHeatmaps();
        renderSubjectHeatmaps();
    }
    
    console.log('탭 전환 완료:', tabName);
}

// 글쓰기 코치 챗봇 설정
function setupChatBot() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const quickQButtons = document.querySelectorAll('.quick-q-btn');
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
    }
    if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    }
    
    quickQButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            addUserMessage(question);
            setTimeout(() => {
                const response = getChatResponse(question);
                addCoachMessage(response);
            }, 500);
        });
    });
    
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            addUserMessage(question);
            setTimeout(() => {
                const response = getChatResponse(question);
                addCoachMessage(response);
            }, 500);
        });
    });
}

// 메시지 전송
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        
        setTimeout(() => {
            const response = getChatResponse(message);
            addCoachMessage(response);
        }, 500);
    }
}

// 사용자 메시지 추가
function addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 코치 메시지 추가
function addCoachMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message coach-message';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 챗봇 응답 생성
function getChatResponse(message) {
    const responses = {
        '서술과 묘사의 차이점': '서술은 "무엇을 했는가"를 말하고, 묘사는 "어떻게 보이는가"를 말합니다. 서술은 사건의 진행을, 묘사는 감각적 경험을 전달해요.',
        '일상 기반 비유': '일상에서 흔히 볼 수 있는 것들을 활용해서 복잡한 개념을 설명하는 방법이에요. 예를 들어, "인터넷은 도서관과 같다"처럼 익숙한 것을 통해 새로운 것을 이해시키는 거죠.',
        '글쓰기 공포': '글쓰기 공포는 누구나 겪는 자연스러운 현상이에요. 완벽하게 쓰려고 하지 말고, 일단 쓰는 것부터 시작하세요.',
        'default': '좋은 질문이네요! 글쓰기는 연습이 가장 중요해요. 매일 조금씩이라도 쓰는 습관을 들여보세요. 🐕'
    };
    
    // 키워드 매칭
    for (const [key, response] of Object.entries(responses)) {
        if (message.includes(key) || key.includes(message)) {
            return response;
        }
    }
    
    return responses.default;
}

// 설정 기능
function setupSettings() {
    console.log('설정 기능 초기화 시작...');
    
    const exportBtn = document.getElementById('export-data');
    const importBtn = document.getElementById('import-data');
    const importFile = document.getElementById('import-file');
    const clearBtn = document.getElementById('clear-data');
    const logoutBtn = document.getElementById('logout-btn');
    const themeOptions = document.querySelectorAll('input[name="theme"]');
    
    console.log('찾은 버튼들:', {
        exportBtn: !!exportBtn,
        importBtn: !!importBtn,
        importFile: !!importFile,
        clearBtn: !!clearBtn,
        logoutBtn: !!logoutBtn
    });
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
        console.log('내보내기 버튼 이벤트 리스너 설정 완료');
    }
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', importData);
        console.log('가져오기 버튼 이벤트 리스너 설정 완료');
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearData);
        console.log('데이터 초기화 버튼 이벤트 리스너 설정 완료');
    }
    
    if (logoutBtn) {
        // 기존 이벤트 리스너 제거 후 새로 추가
        logoutBtn.removeEventListener('click', logout);
        logoutBtn.addEventListener('click', logout);
        console.log('로그아웃 버튼 이벤트 리스너 설정 완료');
    } else {
        console.error('로그아웃 버튼을 찾을 수 없습니다!');
    }
    
    themeOptions.forEach(option => {
        option.addEventListener('change', changeTheme);
    });
    
    // 사용자 정보 표시
    updateUserDisplay();
    
    // 저장된 설정 로드
    loadSettings();
    
    console.log('설정 기능 초기화 완료');
}

// 사용자 정보 표시 업데이트
function updateUserDisplay() {
    const userDisplay = document.getElementById('current-user-display');
    if (userDisplay && currentUser) {
        userDisplay.textContent = currentUser.username;
    }
}

// 로그아웃
function logout() {
    console.log('로그아웃 시도...');
    
    if (!currentUser) {
        console.log('현재 사용자가 없습니다.');
        return;
    }
    
    try {
        // 현재 데이터 저장
        saveUserStudyData(currentUser.id, { subjects, sessions, dailyGoal });
        console.log('데이터 저장 완료');
        
        // 사용자 정보 제거
        localStorage.removeItem('jtSchoolUser');
        console.log('사용자 정보 제거 완료');
        
        // 전역 변수 초기화
        currentUser = null;
        subjects = [];
        sessions = [];
        dailyGoal = 0;
        subjectTimers = {};
        
        // 타이머 정리
        if (subjectTimersInterval) {
            clearInterval(subjectTimersInterval);
            subjectTimersInterval = null;
        }
        
        // UI 초기화
        showLoginScreen();
        
        showToast('로그아웃되었습니다. 안전하게 데이터가 저장되었습니다! 👋', 'success');
        console.log('로그아웃 완료');
        
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        showToast('로그아웃 중 오류가 발생했습니다.', 'error');
    }
}

// 설정 저장
function saveSettings() {
    const settings = {
        theme: document.querySelector('input[name="theme"]:checked')?.value || 'default'
    };
    localStorage.setItem('jtSchoolSettings', JSON.stringify(settings));
}

// 설정 로드
function loadSettings() {
    const savedSettings = localStorage.getItem('jtSchoolSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            if (settings.theme) {
                const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme}"]`);
                if (themeRadio) {
                    themeRadio.checked = true;
                    changeTheme({ target: themeRadio });
                }
            }
        } catch (error) {
            console.error('설정 로드 실패:', error);
        }
    }
}

// 데이터 내보내기
function exportData() {
    if (!currentUser) {
        showToast('로그인이 필요합니다.', 'error');
        return;
    }
    
    const data = {
        userId: currentUser.id,
        sessions: sessions,
        studyData: studyData,
        dailyGoal: dailyGoal,
        subjects: subjects,
        subjectTimers: subjectTimers,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jt-school-timer-data-${currentUser.id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('데이터가 성공적으로 내보내졌습니다.', 'success');
}

// 데이터 가져오기
function importData(event) {
    if (!currentUser) {
        showToast('로그인이 필요합니다.', 'error');
        return;
    }
    
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.sessions && data.subjects) {
                    // 사용자 ID 확인
                    if (data.userId && data.userId !== currentUser.id) {
                        showToast('다른 사용자의 데이터는 가져올 수 없습니다.', 'error');
                        return;
                    }
                    
                    sessions = data.sessions;
                    subjects = data.subjects;
                    subjectTimers = data.subjectTimers || {};
                    dailyGoal = data.dailyGoal || 0;
                    saveData();
                    updateStats();
                    updateSubjectTimers();
                    renderTagHeatmaps();
                    renderSubjectHeatmaps();
                    updateDailyGoalProgress();
                    showToast('데이터가 성공적으로 가져와졌습니다.', 'success');
                }
            } catch (error) {
                showToast('데이터 파일 형식이 올바르지 않습니다.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// 데이터 초기화
function clearData() {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        sessions = [];
        studyData = {};
        dailyGoal = 0;
        subjects = [];
        subjectTimers = {};
        saveData();
        updateStats();
        updateSubjectTimers();
        renderTagHeatmaps();
        renderSubjectHeatmaps();
        updateDailyGoalProgress();
        showToast('모든 데이터가 초기화되었습니다.', 'info');
    }
}

// 테마 변경
function changeTheme(event) {
    const theme = event.target.value;
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    
    if (theme === 'dark') {
        document.body.style.background = 'linear-gradient(135deg, #424242 0%, #212121 100%)';
        document.body.style.color = '#fff';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #FFD54F 0%, #FF9800 100%)';
        document.body.style.color = '#333';
    }
    
    saveSettings();
}

// 데이터 로드 (사용자별 데이터에서 처리됨)
function loadData() {
    // 사용자별 데이터는 loadUserData() 함수에서 처리됨
}

// 페이지 언로드 시 데이터 저장
window.addEventListener('beforeunload', function() {
    if (currentUser && activeSubjectId) {
        // 활성 타이머 데이터를 sessions에 저장
        const subject = subjects.find(s => s.id === activeSubjectId);
        if (subject && subjectTimers[subject.name] > 0) {
            const session = {
                id: Date.now(),
                subjectId: activeSubjectId,
                subjectName: subject.name,
                duration: subjectTimers[subject.name],
                startTime: new Date(Date.now() - (subjectTimers[subject.name] * 1000)).toISOString(),
                endTime: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0]
            };
            
            sessions.push(session);
            
            // 과목 총 시간 업데이트
            subject.totalTime += subjectTimers[subject.name];
            
            // 타이머 초기화
            subjectTimers[subject.name] = 0;
        }
        
        // 데이터 저장
        saveUserStudyData(currentUser.id, { subjects, sessions, dailyGoal });
    }
});

// 과목별 개별 타이머 업데이트
function updateSubjectTimers() {
    const container = document.getElementById('subject-timers');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (subjects.length === 0) {
        container.innerHTML = '<p class="no-subjects">아직 생성된 과목이 없습니다. 위에서 과목을 생성해보세요!</p>';
        return;
    }
    
    // 과목별 카드 생성
    subjects.forEach(subject => {
    const card = document.createElement('div');
        card.className = 'subject-timer-card';
        
        // 현재 활성화된 과목인지 확인
        const isActive = activeSubjectId === subject.id;
        if (isActive) {
            card.classList.add('active');
        }
    
    card.innerHTML = `
            <div class="subject-header">
                <div class="subject-name" style="color: ${subject.color}">${subject.name}</div>
                <div class="subject-tag">${subject.tag || '기타'}</div>
        </div>
            <div class="subject-time-display">
                <div class="subject-time-value">${formatTime(subjectTimers[subject.name] || 0)}</div>
        </div>
            <div class="subject-controls">
                ${isActive 
                    ? `<button class="subject-pause-btn" data-subject-id="${subject.id}">일시정지</button>`
                    : `<button class="subject-start-btn" data-subject-id="${subject.id}">시작</button>`
                }
                <button class="subject-reset-btn" data-subject-id="${subject.id}">리셋</button>
                <button class="subject-delete-btn" data-subject-id="${subject.id}">삭제</button>
        </div>
    `;
    
        container.appendChild(card);
    });
}

// 태그별 학습 히트맵 렌더링 (Git Contribution 스타일)
function renderTagHeatmaps() {
    const tags = ['국어', '수학', '영어', '사회', '과학'];
    
    tags.forEach(tag => {
        const container = document.getElementById(`tag-heatmap-${tag}`);
        if (!container) return;

        container.innerHTML = '';

        // 모바일 최적화: 화면 크기에 따라 히트맵 크기 조정
        const isMobile = window.innerWidth <= 768;
        const cellSize = isMobile ? 12 : 15;
        const gap = isMobile ? 2 : 3;

        // 요일 레이블 추가
        const weekdays = ['', '월', '화', '수', '목', '금', '토', '일'];
        weekdays.forEach((day, index) => {
            const label = document.createElement('div');
            label.className = 'weekday-label';
            label.textContent = day;
            label.style.gridRow = index + 1;
            label.style.gridColumn = 1;
            container.appendChild(label);
        });

        // 앱을 처음 열어본 날짜 찾기
        let earliestDate = new Date();
        
        if (sessions.length > 0) {
            const sessionDates = sessions.map(s => new Date(s.date));
            const earliestSession = new Date(Math.min(...sessionDates));
            if (earliestSession < earliestDate) {
                earliestDate = earliestSession;
            }
        }
        
        // subjectTimers에서도 가장 오래된 날짜 확인
        Object.values(subjectTimers).forEach(timer => {
            if (timer.startDate && new Date(timer.startDate) < earliestDate) {
                earliestDate = new Date(timer.startDate);
            }
        });
        
        // 270일 전과 앱 첫 사용일 중 더 최근 날짜를 시작점으로 설정
        const today = new Date();
        const daysAgo270 = new Date();
        daysAgo270.setDate(today.getDate() - 270);
        
        let startDate;
        if (earliestDate > daysAgo270) {
            startDate = earliestDate;
        } else {
            startDate = daysAgo270;
        }
        startDate.setHours(0, 0, 0, 0);

        // 요일 맞추기 위해 시작일 조정 (월요일이 첫 번째 열이 되도록)
        while (startDate.getDay() !== 1) {
            startDate.setDate(startDate.getDate() - 1);
        }

        // 270개 박스를 유지하기 위한 주차 수 계산 (39주)
        const maxWeeks = 39;
        
        // 각 주차별로 7일씩 박스 생성
        for (let week = 0; week < maxWeeks; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                const dateStr = currentDate.toISOString().split('T')[0];
                
                // 해당 날짜의 해당 태그 과목들의 학습 시간 합산
                let totalSec = 0;
                
                // 저장된 세션의 시간 (해당 태그만)
                totalSec += sessions
                    .filter(s => s.date === dateStr && s.tag === tag)
                    .reduce((sum, s) => sum + s.duration, 0);
                
                // 현재 실행 중인 타이머의 시간도 포함 (오늘인 경우에만, 해당 태그만)
                if (dateStr === today.toISOString().split('T')[0]) {
                    const tagSubjects = subjects.filter(s => s.tag === tag);
                    tagSubjects.forEach(subject => {
                        if (subjectTimers[subject.name]) {
                            totalSec += subjectTimers[subject.name];
                        }
                    });
                }

                // 시간을 분으로 변환하여 레벨 결정
                const totalMinutes = Math.floor(totalSec / 60);
                let level = 0;

                if (totalMinutes > 0) {
                    if (totalMinutes <= 30) level = 1;
                    else if (totalMinutes <= 60) level = 2;
                    else if (totalMinutes <= 120) level = 3;
                    else level = 4;
                }

                const cell = document.createElement('div');
                cell.className = `heatmap-cell level-${level}`;
                
                // 날짜와 공부 시간 정보
                const date = new Date(dateStr);
                const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                
                // 그리드 위치 설정
                cell.style.gridRow = day + 1;
                cell.style.gridColumn = week + 2;
                
                // 해당 날짜의 과목별 시간 계산
                const subjectTimes = {};
                
                // 저장된 세션의 시간 (해당 태그만)
                sessions
                    .filter(s => s.date === dateStr && s.tag === tag)
                    .forEach(s => {
                        if (!subjectTimes[s.subject]) subjectTimes[s.subject] = 0;
                        subjectTimes[s.subject] += s.duration;
                    });
                
                // 현재 실행 중인 타이머의 시간도 포함 (해당 태그만)
                if (dateStr === today.toISOString().split('T')[0]) {
                    const tagSubjects = subjects.filter(s => s.tag === tag);
                    tagSubjects.forEach(subject => {
                        if (subjectTimers[subject.name]) {
                            if (!subjectTimes[subject.name]) subjectTimes[subject.name] = 0;
                            subjectTimes[subject.name] += subjectTimers[subject.name];
                        }
                    });
                }

                let tooltip = `${formattedDate}\n${tag} 총 공부시간: ${formatTime(totalSec)}`;
                if (Object.keys(subjectTimes).length > 0) {
                    tooltip += '\n\n세부 과목별 시간:';
                    for (const [subject, time] of Object.entries(subjectTimes)) {
                        tooltip += `\n${subject}: ${formatTime(time)}`;
                    }
                }
                
                cell.title = tooltip;
                
                // 클릭 및 터치 이벤트 추가
                cell.addEventListener('click', () => {
                    showToast(tooltip, 'info');
                });
                
                // 모바일 터치 이벤트 지원
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    showToast(tooltip, 'info');
                });
                
                container.appendChild(cell);
            }
        }
    });
}

// 과목별 히트맵 렌더링
function renderSubjectHeatmaps() {
    const container = document.getElementById('subject-heatmaps');
    if (!container) return;

    // 기본 태그 목록 (항상 표시)
    const defaultTags = ['국어', '수학', '영어', '사회', '과학'];
    
    // 현재 생성된 과목들의 태그 목록 수집
    const existingTags = [...new Set(subjects.map(s => s.tag))];
    
    // 기본 태그와 기존 태그를 합쳐서 중복 제거
    const allTags = [...new Set([...defaultTags, ...existingTags])];
    
    container.innerHTML = '';

    // 태그별 카드 생성
    allTags.forEach(tag => {
        // 해당 태그의 과목들 가져오기
        const tagSubjects = subjects.filter(s => s.tag === tag);
        
        // today 변수 정의
        const today = new Date();
        
        const card = document.createElement('div');
        card.className = 'subject-heatmap-card';

        const header = document.createElement('div');
        header.className = 'subject-heatmap-header';
        header.innerHTML = `
            <div class="subject-title">${tag}</div>
            <div class="subject-count">${tagSubjects.length}개 과목</div>
        `;
        card.appendChild(header);

        // 월 레이블 추가 (90일 히트맵용)
        const monthLabels = document.createElement('div');
        monthLabels.className = 'month-label';
        
        // 첫 번째 셀은 빈 공간
        const emptyCell = document.createElement('span');
        emptyCell.style.gridColumn = '1';
        monthLabels.appendChild(emptyCell);
        
        // 270개 박스에 맞는 월 레이블 생성
        let lastMonth = -1; // 월 변경 감지를 위한 변수
        for (let week = 0; week < maxWeeks; week++) {
            const weekStartDate = new Date(startDate);
            weekStartDate.setDate(weekStartDate.getDate() + (week * 7));
            
            if (weekStartDate.getMonth() !== lastMonth) {
                const month = document.createElement('span');
                month.textContent = `${weekStartDate.getMonth() + 1}월`;
                month.style.gridColumn = `${week + 2}`; // 해당 주차의 시작 열에 위치
                monthLabels.appendChild(month);
                lastMonth = weekStartDate.getMonth();
            }
        }
        card.appendChild(monthLabels);

        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';

        // 요일 레이블 추가
        const weekdays = ['', '월', '화', '수', '목', '금', '토', '일'];
        weekdays.forEach((day, index) => {
            const label = document.createElement('div');
            label.className = 'weekday-label';
            label.textContent = day;
            label.style.gridRow = index + 1;
            label.style.gridColumn = 1;
            grid.appendChild(label);
        });

        // 날짜별 학습 시간 계산 및 레벨 결정 (앱 첫 사용일부터)
        let startDate = new Date();
        
        // 앱을 처음 열어본 날짜 찾기 (sessions나 subjectTimers에서 가장 오래된 날짜)
        let earliestDate = new Date();
        
        if (sessions.length > 0) {
            const sessionDates = sessions.map(s => new Date(s.date));
            const earliestSession = new Date(Math.min(...sessionDates));
            if (earliestSession < earliestDate) {
                earliestDate = earliestSession;
            }
        }
        
        // subjectTimers에서도 가장 오래된 날짜 확인
        Object.values(subjectTimers).forEach(timer => {
            if (timer.startDate && new Date(timer.startDate) < earliestDate) {
                earliestDate = new Date(timer.startDate);
            }
        });
        
        // 270일 전과 앱 첫 사용일 중 더 최근 날짜를 시작점으로 설정
        const daysAgo270 = new Date();
        daysAgo270.setDate(daysAgo270.getDate() - 270);
        
        if (earliestDate > daysAgo270) {
            startDate = earliestDate;
        } else {
            startDate = daysAgo270;
        }
        startDate.setHours(0, 0, 0, 0);

        // 요일 맞추기 위해 시작일 조정
        while (startDate.getDay() !== 1) { // 월요일이 될 때까지
            startDate.setDate(startDate.getDate() - 1);
        }

        // 270개 박스를 유지하기 위한 주차 수 계산 (최대 39주)
        const maxWeeks = 39;
        const actualWeeks = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const totalWeeks = Math.min(actualWeeks, maxWeeks);
        
        for (let week = 0; week < totalWeeks; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                const dateStr = currentDate.toISOString().split('T')[0];
                
                // 해당 태그의 모든 세션 시간 합산
                let totalSec = 0;
                
                // 저장된 세션의 시간
                totalSec += sessions
                    .filter(s => s.date === dateStr && s.tag === tag)
                    .reduce((sum, s) => sum + s.duration, 0);
                
                // 해당 태그의 과목들의 누적 시간도 포함 (오늘인 경우에만)
                if (dateStr === today.toISOString().split('T')[0]) {
                    tagSubjects.forEach(subject => {
                        if (subjectTimers[subject.name]) {
                            totalSec += subjectTimers[subject.name];
                        }
                    });
                }

                // 시간을 분으로 변환하여 레벨 결정
                const totalMinutes = Math.floor(totalSec / 60);
                let level = 0;

                if (totalMinutes > 0) {
                    if (totalMinutes <= 30) level = 1;
                    else if (totalMinutes <= 60) level = 2;
                    else if (totalMinutes <= 120) level = 3;
                    else level = 4;
                }

                const cell = document.createElement('div');
                cell.className = `heatmap-cell level-${level}`;
                
                // 날짜와 공부 시간 정보
                const date = new Date(dateStr);
                const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                
                // 그리드 위치 설정
                cell.style.gridRow = day + 1;
                cell.style.gridColumn = week + 2;
                
                // 해당 날짜의 과목별 시간 계산
                const subjectTimes = {};
                
                // 저장된 세션의 시간
                sessions
                    .filter(s => s.date === dateStr && s.tag === tag)
                    .forEach(s => {
                        if (!subjectTimes[s.subject]) subjectTimes[s.subject] = 0;
                        subjectTimes[s.subject] += s.duration;
                    });
                
                // 현재 실행 중인 타이머의 시간도 포함
                tagSubjects.forEach(subject => {
                    if (subjectTimers[subject.name]) {
                        if (!subjectTimes[subject.name]) subjectTimes[subject.name] = 0;
                        subjectTimes[subject.name] += subjectTimers[subject.name];
                    }
                });

                let tooltip = `${formattedDate}\n${tag} 총 공부시간: ${formatTime(totalSec)}`;
                if (Object.keys(subjectTimes).length > 0) {
                    tooltip += '\n\n세부 과목별 시간:';
                    for (const [subject, time] of Object.entries(subjectTimes)) {
                        tooltip += `\n${subject}: ${formatTime(time)}`;
                    }
                }
                
                cell.title = tooltip;
                
                // 클릭 및 터치 이벤트 추가
                cell.addEventListener('click', () => {
                    showToast(tooltip, 'info');
                });
                
                // 모바일 터치 이벤트 지원
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    showToast(tooltip, 'info');
                });
                
                grid.appendChild(cell);
            }
        }

        card.appendChild(grid);
        container.appendChild(card);
    });
}

// 전체 공부 시간 업데이트
function updateTotalStudyTime() {
    const totalElement = document.getElementById('total-study-time');
    if (!totalElement) return;
    
    const totalSeconds = Object.values(subjectTimers).reduce((sum, time) => sum + time, 0);
    totalElement.textContent = formatTime(totalSeconds);
}

// 일일 목표 설정
function setupDailyGoal() {
    const goalInput = document.getElementById('daily-goal-input');
    const goalBtn = document.getElementById('daily-goal-btn');
    
    if (goalInput && goalBtn) {
        goalBtn.addEventListener('click', function() {
            const goal = parseInt(goalInput.value);
            if (goal >= 0) {
                dailyGoal = goal;
                saveUserStudyData(currentUser.id, { subjects, sessions, dailyGoal });
                updateStats();
                showToast(`일일 목표가 ${formatTime(goal)}로 설정되었습니다! 🎯`, 'success');
                goalInput.value = '';
            } else {
                showToast('올바른 목표 시간을 입력해주세요.', 'error');
            }
        });
    }
}

// 일일 목표 진행률 업데이트
function updateDailyGoalProgress() {
    const progressFill = document.getElementById('goal-progress-fill');
    const goalStatus = document.getElementById('goal-status');
    
    if (!progressFill || !goalStatus) return;
    
    if (dailyGoal === 0) {
        progressFill.style.width = '0%';
        goalStatus.textContent = '목표를 설정해주세요';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.date === today);
    const todaySessionsTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    
    // 과목별 타이머의 누적 시간도 포함
    const todaySubjectTimersTotal = Object.values(subjectTimers).reduce((sum, time) => sum + time, 0);
    const todayTotal = todaySessionsTotal + todaySubjectTimersTotal;
    
    const progress = Math.min((todayTotal / dailyGoal) * 100, 100);
    progressFill.style.width = `${progress}%`;
    
    if (progress >= 100) {
        const exceeded = todayTotal - dailyGoal;
        goalStatus.textContent = `🎉 목표 달성! +${formatTime(exceeded)}`;
        goalStatus.style.color = '#4CAF50';
        } else {
        const remaining = dailyGoal - todayTotal;
        goalStatus.textContent = `${formatTime(todayTotal)} / ${formatTime(dailyGoal)} (${formatTime(remaining)} 남음)`;
        goalStatus.style.color = '#FF9800';
    }
}

// 과목별 개별 타이머 시작
function startSubjectTimer(subjectId) {
    // 다른 과목이 활성화되어 있다면 중지
    if (activeSubjectId && activeSubjectId !== subjectId) {
        pauseSubjectTimer(activeSubjectId);
    }
    
    activeSubjectId = subjectId;
    const subject = subjects.find(s => s.id == subjectId);
    
    if (!subject) return;
    
    // 해당 과목의 타이머 시작
    if (subjectTimersInterval) {
        clearInterval(subjectTimersInterval);
    }
    
    // 타이머가 없으면 초기화
    if (subjectTimers[subject.name] === undefined) {
        subjectTimers[subject.name] = 0;
    }
    
    subjectTimersInterval = setInterval(() => {
        subjectTimers[subject.name]++;
        
        // UI 업데이트
        updateSubjectTimers();
        updateTotalStudyTime();
        updateStats();
        
        // 실시간으로 히트맵 색깔 업데이트 (오늘 날짜만)
        updateTodayHeatmapColor(subject.tag);
        
        // 태그별 히트맵도 실시간 업데이트
        renderTagHeatmaps();
        
        // 데이터 저장
        if (currentUser) {
            saveUserStudyData(currentUser.id, { subjects, sessions, dailyGoal });
        }
    }, 1000);
    
    // UI 업데이트
    updateSubjectTimers();
    
    showToast(`"${subject.name}" 과목 타이머가 시작되었습니다!`, 'success');
}

// 과목별 개별 타이머 일시정지
function pauseSubjectTimer(subjectId) {
    if (activeSubjectId !== subjectId) return;
    
    activeSubjectId = null;
    
    if (subjectTimersInterval) {
        clearInterval(subjectTimersInterval);
        subjectTimersInterval = null;
    }
    
    // UI 업데이트
    updateSubjectTimers();
    
    // 태그별 히트맵도 업데이트
    renderTagHeatmaps();
    
    const subject = subjects.find(s => s.id == subjectId);
    if (subject) {
        showToast(`"${subject.name}" 과목 타이머가 일시정지되었습니다.`, 'info');
    }
}

// 과목별 개별 타이머 리셋
function resetSubjectTimer(subjectId) {
    const subject = subjects.find(s => s.id == subjectId);
    if (!subject) return;
    
    // 활성화된 과목이라면 중지
    if (activeSubjectId === subjectId) {
        pauseSubjectTimer(subjectId);
    }
    
    // 시간 초기화
    subjectTimers[subject.name] = 0;
    
    // UI 업데이트
    updateSubjectTimers();
    updateTotalStudyTime();
    
    // 태그별 히트맵도 업데이트
    renderTagHeatmaps();
    
    // 데이터 저장
    if (currentUser) {
        saveUserStudyData(currentUser.id, { subjects, sessions, dailyGoal });
    }
    
    showToast(`"${subject.name}" 과목 타이머가 리셋되었습니다.`, 'info');
}

// 과목 삭제
function deleteSubject(subjectId) {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    // 확인 대화상자
    if (!confirm(`"${subject.name}" 과목을 삭제하시겠습니까?\n\n⚠️ 이 과목의 모든 학습 기록이 영구적으로 삭제됩니다.`)) {
        return;
    }
    
    // 과목 제거
    subjects = subjects.filter(s => s.id !== subjectId);
    
    // 관련 세션 제거
    sessions = sessions.filter(s => s.subjectId !== subjectId);
    
    // 과목 타이머 제거
    if (subjectTimers[subject.name]) {
        delete subjectTimers[subject.name];
    }
    
    // 데이터 저장
    saveUserStudyData(currentUser.id, { subjects, sessions, dailyGoal });
    
    // UI 업데이트
    updateSubjectList();
    updateSubjectTimers();
    updateStats();
    
    showToast(`"${subject.name}" 과목이 삭제되었습니다. ️`, 'success');
}

// 모든 과목 타이머 일시정지 (휴식 기능)
function pauseAllSubjectTimers() {
    if (activeSubjectId) {
        activeSubjectId = null;
        
        if (subjectTimersInterval) {
            clearInterval(subjectTimersInterval);
            subjectTimersInterval = null;
        }
        
        // UI 업데이트
        updateSubjectTimers();
        
        showToast('모든 과목 타이머가 일시정지되었습니다. 휴식 시간입니다!', 'info');
    } else {
        showToast('현재 실행 중인 과목 타이머가 없습니다.', 'info');
    }
}

// 오늘 날짜의 히트맵 색깔을 실시간으로 업데이트
function updateTodayHeatmapColor(tag) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 해당 태그의 오늘 학습 시간 계산
    const tagSubjects = subjects.filter(s => s.tag === tag);
    let totalSec = 0;
    
    // 저장된 세션의 시간
    totalSec += sessions
        .filter(s => s.date === todayStr && s.tag === tag)
        .reduce((sum, s) => sum + s.duration, 0);
    
    // 현재 실행 중인 타이머의 시간도 포함
    tagSubjects.forEach(subject => {
        if (subjectTimers[subject.name]) {
            totalSec += subjectTimers[subject.name];
        }
    });
    
    // 시간을 분으로 변환하여 레벨 결정
    const totalMinutes = Math.floor(totalSec / 60);
    let level = 0;
    
    if (totalMinutes > 0) {
        if (totalMinutes <= 30) level = 1;
        else if (totalMinutes <= 60) level = 2;
        else if (totalMinutes <= 120) level = 3;
        else level = 4;
    }
    
    // 오늘 날짜에 해당하는 히트맵 셀 찾기
    let startDate = new Date();
    
    // 앱을 처음 열어본 날짜 찾기
    let earliestDate = new Date();
    
    if (sessions.length > 0) {
        const sessionDates = sessions.map(s => new Date(s.date));
        const earliestSession = new Date(Math.min(...sessionDates));
        if (earliestSession < earliestDate) {
            earliestDate = earliestSession;
        }
    }
    
    // subjectTimers에서도 가장 오래된 날짜 확인
    Object.values(subjectTimers).forEach(timer => {
        if (timer.startDate && new Date(timer.startDate) < earliestDate) {
            earliestDate = new Date(timer.startDate);
        }
    });
    
    // 270일 전과 앱 첫 사용일 중 더 최근 날짜를 시작점으로 설정
    const daysAgo270 = new Date();
    daysAgo270.setDate(daysAgo270.getDate() - 270);
    
    if (earliestDate > daysAgo270) {
        startDate = earliestDate;
    } else {
        startDate = daysAgo270;
    }
    startDate.setHours(0, 0, 0, 0);
    
    // 요일 맞추기 위해 시작일 조정
    while (startDate.getDay() !== 1) {
        startDate.setDate(startDate.getDate() - 1);
    }
    
    // 오늘 날짜가 몇 번째 주, 몇 번째 요일에 해당하는지 계산
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7);
    const day = diffDays % 7;
    
    // 해당 태그의 히트맵에서 오늘 날짜 셀 찾기
    const heatmapContainer = document.getElementById('subject-heatmaps');
    if (heatmapContainer) {
        const tagCards = heatmapContainer.querySelectorAll('.subject-heatmap-card');
        tagCards.forEach(card => {
            const header = card.querySelector('.subject-heatmap-header .subject-title');
            if (header && header.textContent === tag) {
                const grid = card.querySelector('.heatmap-grid');
                if (grid) {
                    // 오늘 날짜에 해당하는 셀 찾기
                    const todayCell = grid.querySelector(`[style*="grid-row: ${day + 1}"][style*="grid-column: ${week + 2}"]`);
                    if (todayCell) {
                        // 기존 레벨 클래스 제거
                        todayCell.className = 'heatmap-cell';
                        // 새로운 레벨 클래스 추가
                        todayCell.classList.add(`level-${level}`);
                        
                        // 툴팁 업데이트
                        const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
                        const subjectTimes = {};
                        
                        // 저장된 세션의 시간
                        sessions
                            .filter(s => s.date === todayStr && s.tag === tag)
                            .forEach(s => {
                                if (!subjectTimes[s.subject]) subjectTimes[s.subject] = 0;
                                subjectTimes[s.subject] += s.duration;
                            });
                        
                                        // 현재 실행 중인 타이머의 시간도 포함 (오늘인 경우)
                if (dateStr === today.toISOString().split('T')[0]) {
                    tagSubjects.forEach(subject => {
                        if (subjectTimers[subject.name]) {
                            if (!subjectTimes[subject.name]) subjectTimes[subject.name] = 0;
                            subjectTimes[subject.name] += subjectTimers[subject.name];
                        }
                    });
                }
                        
                        let tooltip = `${formattedDate}\n${tag} 총 공부시간: ${formatTime(totalSec)}`;
                        if (Object.keys(subjectTimes).length > 0) {
                            tooltip += '\n\n세부 과목별 시간:';
                            for (const [subject, time] of Object.entries(subjectTimes)) {
                                tooltip += `\n${subject}: ${formatTime(time)}`;
                            }
                        }
                        
                        todayCell.title = tooltip;
                    }
                }
            }
        });
    }
}

// 모바일 메뉴 토글 - 완벽한 버전
function toggleMobileMenu(e) {
    // 이벤트 기본 동작 방지
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('모바일 메뉴 토글 시도');
    
    // DOM 요소 완벽 확인
    if (!nav || !mobileMenuToggle) {
        console.error('필요한 DOM 요소를 찾을 수 없습니다:', { nav: !!nav, mobileMenuToggle: !!mobileMenuToggle });
        return false;
    }
    
    const isExpanded = nav.classList.contains('show');
    console.log('현재 메뉴 상태:', isExpanded ? '열림' : '닫힘');
    
    if (isExpanded) {
        return closeMobileMenu();
    } else {
        return openMobileMenu();
    }
}

// 모바일 메뉴 열기 - 완벽한 버전
function openMobileMenu() {
    console.log('모바일 메뉴 열기 시도');
    
    if (!nav || !mobileMenuToggle) {
        console.error('필요한 DOM 요소를 찾을 수 없습니다');
        return false;
    }
    
    try {
        // 기존 show 클래스 제거 후 추가 (중복 방지)
        nav.classList.remove('show');
        nav.classList.add('show');
        
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.classList.add('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
        }
        
        // 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        // 모바일에서 메뉴 열림 상태 저장
        localStorage.setItem('jtSchoolMobileMenuOpen', 'true');
        
        // 메뉴 열림 애니메이션 완료 후 이벤트 리스너 추가
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
            document.addEventListener('touchstart', handleOutsideClick);
        }, 100);
        
        console.log('모바일 메뉴가 열렸습니다');
        return true;
    } catch (error) {
        console.error('모바일 메뉴 열기 실패:', error);
        return false;
    }
}

// 모바일 메뉴 닫기 - 완벽한 버전
function closeMobileMenu() {
    console.log('모바일 메뉴 닫기 시도');
    
    if (!nav || !mobileMenuToggle) {
        console.error('필요한 DOM 요소를 찾을 수 없습니다');
        return false;
    }
    
    try {
        if (nav.classList.contains('show')) {
            nav.classList.remove('show');
            
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
            
            // 스크롤 복원
            document.body.style.overflow = '';
            
            // 모바일에서 메뉴 닫힘 상태 저장
            localStorage.setItem('jtSchoolMobileMenuOpen', 'false');
            
            // 이벤트 리스너 제거
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
            
            console.log('모바일 메뉴가 닫혔습니다');
            return true;
        }
        return false;
    } catch (error) {
        console.error('모바일 메뉴 닫기 실패:', error);
        return false;
    }
}

// 메뉴 외부 클릭 처리 - 완벽한 버전
function handleOutsideClick(e) {
    if (!nav || !mobileMenuToggle) return;
    
    // 터치 이벤트와 클릭 이벤트 모두 처리
    const target = e.target || e.touches?.[0]?.target;
    if (!target) return;
    
    if (!nav.contains(target) && !mobileMenuToggle.contains(target)) {
        console.log('메뉴 외부 클릭/터치 감지, 메뉴 닫기');
        closeMobileMenu();
    }
}

// 모바일 메뉴 상태 복구 함수
function restoreMobileMenuState() {
    try {
        const wasOpen = localStorage.getItem('jtSchoolMobileMenuOpen') === 'true';
        if (wasOpen && nav && mobileMenuToggle) {
            // 페이지 새로고침 후 메뉴 상태 복구
            setTimeout(() => {
                if (nav.classList.contains('show')) {
                    console.log('모바일 메뉴 상태 복구됨');
                }
            }, 100);
        }
    } catch (error) {
        console.error('모바일 메뉴 상태 복구 실패:', error);
    }
}

// 토스트 알림 표시
function showToast(message, type = 'info') {
    // 토스트 컨테이너가 없으면 생성
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 모바일 최적화 스타일 - 완벽한 버전
function setupMobileOptimization() {
    console.log('모바일 최적화 설정 시작');
    
    // 1. 터치 이벤트 최적화 - 완벽한 방식
    let touchStartY = 0;
    let touchStartX = 0;
    
    // 스크롤 방지 - 정확한 조건으로 수정
    document.addEventListener('touchmove', function(e) {
        // 실제로 타이머가 활성화되어 있을 때만 스크롤 방지
        if (activeSubjectId && document.querySelector('.subject-timer-card.active')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 2. 더블 탭 줌 방지 - 완벽한 버전
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // 3. 터치 피드백 - 모든 클릭 가능한 요소에 완벽 적용
    const touchElements = document.querySelectorAll('button, .btn, .tab-button, .subject-item, .timer-control, .nav-btn, .subject-start-btn, .subject-pause-btn, .subject-reset-btn, .subject-delete-btn, .heatmap-cell, .quick-q-btn, .preset-btn, .nav-btn');
    touchElements.forEach(element => {
        // 기존 이벤트 리스너 제거 후 새로 추가
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchCancel);
        
        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchend', handleTouchEnd);
        element.addEventListener('touchcancel', handleTouchCancel);
    });
    
    // 4. 모바일 뷰포트 최적화
    if (window.innerWidth <= 768) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
    
    // 5. 터치 이벤트 최적화
    if ('ontouchstart' in window) {
        document.documentElement.classList.add('touch-device');
    }
    
    console.log('모바일 최적화 설정 완료');
}

// 터치 이벤트 핸들러 함수들
function handleTouchStart(e) {
    this.style.transform = 'scale(0.95)';
    this.style.transition = 'transform 0.1s ease';
}

function handleTouchEnd(e) {
    this.style.transform = 'scale(1)';
}

function handleTouchCancel(e) {
    this.style.transform = 'scale(1)';
}

// 모바일 키보드 처리
function setupMobileKeyboard() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // 모바일에서 입력 필드 포커스 시 뷰포트 조정
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
        
        input.addEventListener('blur', function() {
            // 입력 완료 후 뷰포트 복원
            if (window.innerWidth <= 768) {
                window.scrollTo(0, 0);
            }
        });
    });
}

// 모바일 화면 방향 변경 처리 - 완벽한 버전
function setupOrientationChange() {
    window.addEventListener('orientationchange', function() {
        console.log('화면 방향 변경 감지');
        
        // 화면 방향 변경 후 레이아웃 재조정 - 완벽한 처리
        setTimeout(() => {
            try {
                // 히트맵 재계산
                renderTagHeatmaps();
                renderSubjectHeatmaps();
                
                // 타이머 표시 재조정
                updateSubjectTimers();
                
                // 통계 업데이트
                updateStats();
                
                // 모바일 메뉴 상태 확인 및 복구
                if (nav && nav.classList.contains('show')) {
                    // 화면 방향 변경 시 메뉴가 열려있다면 닫기
                    closeMobileMenu();
                }
                
                console.log('화면 방향 변경 후 레이아웃 재조정 완료');
            } catch (error) {
                console.error('화면 방향 변경 처리 중 오류:', error);
            }
        }, 500); // 시간을 늘려서 안정성 향상
    });
}

// 모바일 성능 최적화
function setupMobilePerformance() {
    // 스크롤 성능 최적화
    if ('scrollBehavior' in document.documentElement.style) {
        document.documentElement.style.scrollBehavior = 'auto';
    }
    
    // 터치 이벤트 최적화
    if ('ontouchstart' in window) {
        document.documentElement.classList.add('touch-device');
    }
    
    // 배터리 절약 모드 감지
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            if (battery.level < 0.2) {
                // 배터리 부족 시 애니메이션 줄이기
                document.documentElement.style.setProperty('--transition', '100ms ease');
            }
        });
        navigator.getBattery().then(battery => {
            battery.addEventListener('levelchange', () => {
                if (battery.level < 0.2) {
                    document.documentElement.style.setProperty('--transition', '100ms ease');
                } else {
                    document.documentElement.style.setProperty('--transition', '200ms ease');
                }
            });
        });
    }
}

// 로그인 화면 표시
function showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');
    
    if (loginScreen) loginScreen.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
    
    // 로그인 폼 초기화
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.reset();
        loginForm.classList.add('active');
    }
    if (registerForm) {
        registerForm.classList.remove('active');
        registerForm.reset();
    }
    
    // 전역 변수 초기화
    subjects = [];
    sessions = [];
    dailyGoal = 0;
    subjectTimers = {};
    activeSubjectId = null;
    
    // 타이머 정리
    if (subjectTimersInterval) {
        clearInterval(subjectTimersInterval);
        subjectTimersInterval = null;
    }
    
    // 이벤트 리스너 정리
    cleanupEventListeners();
}

// 이벤트 리스너 정리 - 완벽한 버전
function cleanupEventListeners() {
    console.log('이벤트 리스너 정리 시작');
    
    try {
        // 모바일 메뉴 관련 이벤트 리스너 정리
        if (mobileMenuToggle) {
            mobileMenuToggle.removeEventListener('click', toggleMobileMenu);
            mobileMenuToggle.removeEventListener('touchstart', toggleMobileMenu);
        }
        
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
        document.removeEventListener('keydown', handleEscapeKey);
        
        // 터치 이벤트 리스너 정리
        const touchElements = document.querySelectorAll('button, .btn, .tab-button, .subject-item, .timer-control, .nav-btn, .subject-start-btn, .subject-pause-btn, .subject-reset-btn, .subject-delete-btn, .heatmap-cell, .quick-q-btn, .preset-btn');
        touchElements.forEach(element => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchCancel);
        });
        
        // 기존 이벤트 리스너 제거
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.removeEventListener('click', logout);
        }
        
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.removeEventListener('click', exportData);
        }
        
        const importBtn = document.getElementById('import-data');
        if (importBtn) {
            importBtn.removeEventListener('click', () => {});
        }
        
        const clearBtn = document.getElementById('clear-data');
        if (clearBtn) {
            clearBtn.removeEventListener('click', clearData);
        }
        
        console.log('이벤트 리스너 정리 완료');
        return true;
    } catch (error) {
        console.error('이벤트 리스너 정리 실패:', error);
        return false;
    }
}

// 모바일 메뉴 상태 확인 함수 - 완벽한 버전
function checkMobileMenuState() {
    if (!nav || !mobileMenuToggle) {
        console.error('모바일 메뉴 요소가 없습니다');
        return false;
    }
    
    const isOpen = nav.classList.contains('show');
    const toggleState = mobileMenuToggle.classList.contains('active');
    const ariaExpanded = mobileMenuToggle.getAttribute('aria-expanded');
    
    console.log('모바일 메뉴 상태:', {
        isOpen,
        toggleState,
        ariaExpanded,
        navClasses: nav.className,
        toggleClasses: mobileMenuToggle.className
    });
    
    return isOpen;
}

// 모바일 메뉴 강제 초기화 함수 - 완벽한 버전
function resetMobileMenu() {
    console.log('모바일 메뉴 강제 초기화');
    
    try {
        if (nav) {
            nav.classList.remove('show');
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
        
        document.body.style.overflow = '';
        
        // 이벤트 리스너 제거
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
        
        // 로컬 스토리지 상태 초기화
        localStorage.setItem('jtSchoolMobileMenuOpen', 'false');
        
        console.log('모바일 메뉴 초기화 완료');
        return true;
    } catch (error) {
        console.error('모바일 메뉴 초기화 실패:', error);
        return false;
    }
}

// 모바일 메뉴 문제 해결 함수 - 완벽한 버전
function fixMobileMenuIssues() {
    console.log('모바일 메뉴 문제 해결 시도');
    
    try {
        // 1. 메뉴 상태 확인
        const currentState = checkMobileMenuState();
        
        // 2. 문제가 있다면 강제 초기화
        if (currentState === null || document.body.style.overflow === 'hidden') {
            resetMobileMenu();
        }
        
        // 3. 이벤트 리스너 재설정
        if (mobileMenuToggle) {
            mobileMenuToggle.removeEventListener('click', toggleMobileMenu);
            mobileMenuToggle.removeEventListener('touchstart', toggleMobileMenu);
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);
            mobileMenuToggle.addEventListener('touchstart', toggleMobileMenu);
        }
        
        console.log('모바일 메뉴 문제 해결 완료');
        return true;
    } catch (error) {
        console.error('모바일 메뉴 문제 해결 실패:', error);
        return false;
    }
}
