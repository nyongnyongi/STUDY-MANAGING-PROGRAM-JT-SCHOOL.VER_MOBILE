# JT SCHOOL 타이머 🐕

열품타처럼 "공부 시간 기록과 집중"에 최적화된 JT SCHOOL 타이머입니다. 웰시코기 마스코트와 함께하는 효율적인 공부 시간 관리 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🕐 공부 타이머
- **뽀모도로 기법**: 집중 시간(기본 25분)과 휴식 시간(기본 5분) 설정
- **커스터마이징**: 집중/휴식 시간을 1분~2시간/30분까지 자유롭게 조정
- **자동 전환**: 집중 시간 완료 시 자동으로 휴식 시간으로 전환
- **소리 알림**: 타이머 완료 시 시각적/청각적 알림

### 📊 학습 타임라인
- **주간/월간 통계**: 학습 시간을 시각적으로 확인
- **연속 학습일**: 꾸준한 학습 습관 형성 동기부여
- **차트 시각화**: Canvas를 활용한 막대 차트로 학습 패턴 분석

### 💬 글쓰기 코치 (정적 챗봇)
- **AI 연동 없음**: 미리 준비된 Q&A 기반 응답
- **실전형 가이드**: 서술 vs 묘사, 일상 기반 비유, 독서=연료 등
- **글쓰기 공포 극복**: 학생들의 글쓰기 부담감 완화
- **빠른 질문**: 자주 묻는 질문 버튼으로 즉시 답변

### ⚙️ 설정 및 데이터 관리
- **데이터 내보내기/가져오기**: JSON 형태로 학습 데이터 백업
- **테마 설정**: 기본 테마와 다크 모드 지원
- **알림 설정**: 소리 및 브라우저 알림 개인화
- **로컬 스토리지**: 브라우저에 학습 데이터 자동 저장

## 🎨 디자인 특징

- **테마 색상**: 노란색(#FFD54F)과 주황색(#FF9800) 그라데이션
- **마스코트**: 웰시코기 이모지(🐕)를 활용한 친근한 브랜딩
- **폰트**: Noto Sans KR로 한글 가독성 최적화
- **반응형**: 모바일과 데스크톱 모두에서 최적화된 사용자 경험
- **모던 UI**: 글래스모피즘과 부드러운 애니메이션

## 🚀 배포 방법

### Netlify 배포 (권장)

1. **GitHub에 코드 업로드**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: JT SCHOOL 타이머"
   git branch -M main
   git remote add origin [your-github-repo-url]
   git push -u origin main
   ```

2. **Netlify에서 배포**
   - [Netlify](https://netlify.com)에 로그인
   - "New site from Git" 클릭
   - GitHub 저장소 연결
   - 자동 배포 설정 완료

3. **커스텀 도메인 설정** (선택사항)
   - Netlify 대시보드에서 "Domain settings" 클릭
   - "Add custom domain"으로 원하는 도메인 연결

### 정적 호스팅 서비스

- **Vercel**: `vercel --prod` 명령어로 배포
- **GitHub Pages**: 저장소 설정에서 Pages 활성화
- **Firebase Hosting**: `firebase deploy` 명령어로 배포

## 🛠️ 기술 스택

- **Frontend**: 순수 HTML5, CSS3, JavaScript (ES6+)
- **차트**: Canvas API를 활용한 커스텀 차트
- **스토리지**: LocalStorage API
- **폰트**: Google Fonts (Noto Sans KR)
- **배포**: Netlify (정적 사이트 호스팅)

## 📱 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔧 로컬 개발

1. **저장소 클론**
   ```bash
   git clone [your-repo-url]
   cd jt-school-timer
   ```

2. **로컬 서버 실행**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

3. **브라우저에서 확인**
   ```
   http://localhost:8000
   ```

## 📊 데이터 구조

### 세션 데이터
```json
{
  "id": 1703123456789,
  "date": "2023-12-21",
  "duration": 1500,
  "timestamp": 1703123456789
}
```

### 설정 데이터
```json
{
  "focusTime": 1500,
  "breakTime": 300,
  "soundNotification": true,
  "browserNotification": true,
  "theme": "default"
}
```

## 🎯 사용 시나리오

### 학생용
- **시험 준비**: 뽀모도로 기법으로 집중력 향상
- **과제 작성**: 글쓰기 코치와 함께 글쓰기 능력 개발
- **학습 기록**: 주간/월간 학습량으로 성취감 확인

### 자기계발용
- **독서 시간**: 독서 습관 형성과 시간 관리
- **취미 학습**: 새로운 기술이나 언어 학습
- **프로젝트 작업**: 집중력이 필요한 작업 시간 관리

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- **열품타**: 영감을 주신 원작자에게 감사드립니다
- **웰시코기**: 귀여운 마스코트로 동기부여를 주는 강아지에게
- **Noto Sans KR**: 아름다운 한글 폰트를 제공해주신 Google Fonts

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

**JT SCHOOL 타이머와 함께 효율적인 공부 시간을 만들어보세요! 🐕✨**
