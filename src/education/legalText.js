// Văn bản pháp lý của Education Hugo bằng ba ngôn ngữ (vi/en/zh) — giao diện ngôn ngữ nào hiện bản đó.
// Ba bản phải cùng nội dung; bản tiếng Anh là bản gốc. Mọi khẳng định ở đây phải khớp với hệ thống thật:
// sửa luồng dữ liệu (thêm nhà cung cấp, đổi thời hạn lưu, thêm loại dữ liệu) thì sửa văn bản này.
// Đổi nội dung đáng kể → cập nhật UPDATED và báo người học (push/hộp thông báo).
export const UPDATED = { en: "3 November 2026", vi: "03/11/2026", zh: "2026年11月3日" };
export const UPDATED_LABEL = { en: "Last updated", vi: "Cập nhật lần cuối", zh: "最后更新" };
export const CONTACT = "contact@hugowishpax.studio";

const EN = {
  terms: {
    title: "Terms of Use",
    lead: "These Terms govern your use of Education Hugo, the free learning service operated by Hugo Studio at education.hugowishpax.studio. By creating an account or continuing to use the service, you accept them in full. If you do not, please refrain from using Education Hugo.",
    sections: [
      {
        h: "1. Who we are",
        p: [
          "Education Hugo is a free community learning project operated by Hugo Studio. It charges no tuition or access fee and may receive voluntary donations to support the project. It has its own accounts, servers and data. You may sign in with Google, with your Hugo Studio account (www.hugowishpax.studio) or with a passkey; signing in with Hugo Studio only shares your name, email and profile picture with us, and no other Hugo Studio data.",
          "Education Hugo was conceived and built by Hugo, a student at the University of Greenwich (Vietnam), as a non-profit contribution to the community. Its source code, lessons, characters and artwork belong to the author unless stated otherwise; do not copy or republish them without permission.",
          `Questions about these Terms may be addressed to ${CONTACT}.`,
        ],
      },
      {
        h: "2. Eligibility",
        p: [
          "You must be at least 14 years of age to hold an account. Learners aged 14 or 15 must provide a parent or legal guardian's phone number and confirm that the guardian has permitted the account. Learners aged 16 or 17 should still use the service with their parent or guardian's knowledge.",
          "You may hold only one account, and you must not create an account on behalf of another person or impersonate anyone.",
        ],
      },
      {
        h: "3. Your account",
        p: [
          "You sign in with Google or with a passkey (Face ID, fingerprint or a device PIN). You are responsible for safeguarding the devices and credentials that give access to your account and for all activity that occurs under it. Notify us without delay if you suspect unauthorised access.",
          "Courses and accounts are free of charge and accounts do not expire. We may close accounts that breach these Terms.",
        ],
      },
      {
        h: "4. Gems, XP and streaks",
        p: [
          "Gems, XP, streaks, milestones and league positions are in-service motivational features. They carry no monetary value, cannot be redeemed for cash and confer no proprietary right. Their rules are computed exclusively by our servers, and we may recalibrate them to preserve fairness.",
          "Any attempt to obtain gems, XP or progress by automation, scripted submissions, exploitation of defects or collusion is prohibited. We may reverse illegitimately obtained balances and suspend the accounts concerned.",
        ],
      },
      {
        h: "5. The item shop",
        p: [
          "You may exchange gems for items in the Store. Each item takes effect as soon as the purchase succeeds: a badge is worn on your member card and public profile; Double XP doubles league XP for the stated number of hours, and further purchases add to the remaining time; a Streak Shield automatically thaws a day you missed at 8 a.m. the following morning, up to five shields at a time. Prices, stock and descriptions are shown before you confirm.",
          "Items are personal and cannot be transferred, resold or exchanged for money. A completed purchase is final; if an item cannot be applied for a technical reason, the purchase is cancelled and the gems are returned automatically. We may adjust prices, withdraw items or change stock at any time without affecting items you already hold.",
        ],
      },
      {
        h: "6. Course content and intellectual property",
        p: [
          "Lessons, quizzes, illustrations, mascots, source code samples and the curriculum itself are the work of Hugo Studio and are protected by copyright. Real photographs used in lessons are reproduced under the Creative Commons licence credited beneath each one, and the SQLite engine that runs the SQL exercises is in the public domain. You may use them for your personal learning. You may not scrape, republish, sell or systematically reproduce them without written permission.",
          "Code you write while following a lesson belongs to you. Third-party assets are used under their own licences, which are credited where they appear (for example the pixel-art character style by DiceBear under CC0, and the “Spiro Streak” flame animation under CC BY 4.0).",
        ],
      },
      {
        h: "7. Ads and user input",
        p: [
          "The Ads page contains programmes, events and notices posted only by Education Hugo administrators. Learners cannot publish posts, comments or friend requests; they may only view notices and add or remove a like.",
          "Information you submit through your profile, lesson feedback or support forms must be lawful, accurate and must not contain another person's personal information without permission.",
        ],
      },
      {
        h: "8. Moderation and enforcement",
        p: [
          "Profile, feedback and support input may be reviewed to protect the service and its learners. Administrator notices may be corrected or removed at any time.",
          "Serious or repeated breaches may lead to the reset of a nickname or character, the loss of illegitimate gems or XP, or the suspension or termination of the account. Where practicable, we will tell you what action was taken and why.",
        ],
      },
      {
        h: "9. Availability and changes",
        p: [
          "Education Hugo runs on free-tier infrastructure and is provided on an “as is” and “as available” basis. We strive for continuity but do not guarantee uninterrupted or error-free operation, and features may degrade gracefully when free quotas are exhausted.",
          "We may modify, add or withdraw features and amend these Terms. Material changes will be announced in the service before they take effect; continued use thereafter constitutes acceptance.",
        ],
      },
      {
        h: "10. Liability",
        p: [
          "To the fullest extent permitted by law, Hugo Studio shall not be liable for indirect or consequential loss arising from your use of, or inability to use, the service. Nothing in these Terms excludes liability that cannot lawfully be excluded, nor limits any statutory right you hold as a consumer.",
        ],
      },
      {
        h: "11. Governing law",
        p: [
          "These Terms are governed by the laws of the Socialist Republic of Vietnam. We will first seek to resolve any dispute amicably; failing that, it shall be submitted to the competent court of Vietnam.",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    lead: "This Policy explains what personal data Education Hugo processes, why, with whom it is shared and how you may exercise control over it. We collect only what the service genuinely needs and never sell personal data or display third-party behavioural advertising.",
    sections: [
      {
        h: "1. Controller",
        p: [
          `Hugo Studio is the controller of the personal data described here. Requests concerning your data may be sent to ${CONTACT}. We process personal data in accordance with applicable Vietnamese law on personal data protection, including the Law on Personal Data Protection 2025 (effective 1 January 2026), Decree No. 13/2023/ND-CP and any legislation that succeeds them.`,
        ],
      },
      {
        h: "2. Data we process",
        list: [
          "Account data — your email address and display name from Google sign-in; for passkeys, a public key and device label (the biometric itself never leaves your device).",
          "Profile identity (Persona) — nickname, pixel-art character and short introduction. These are used within your own account; your real name, email and photograph are not displayed on the Ads page.",
          "Learning data — completed steps and lessons, quiz answers and scores, streak calendar, XP, daily goals and personal settings. SQL exercises run entirely inside your browser; what you type there is kept only on your device as a draft and is never sent to us.",
          "Store data — items you have bought, the badge you wear, remaining Streak Shields and Double XP time, together with the gem transactions that paid for them.",
          "Feedback — your ratings and comments in the Education Hugo survey, and the reports and support requests you send; you can review all of them under Profile › Feedback history.",
          "Interaction data — likes you add to administrator notices. For learners aged 14–15, we also store the parent or guardian phone number and the learner's confirmation of permission.",
          "Device and notification data — push subscriptions with the device language, notifications delivered to your inbox, and technical security records such as IP address and user agent, used to detect abuse.",
          "Performance metrics — anonymous page-speed and error measurements that contain no identifier of you.",
        ],
      },
      {
        h: "3. Why we process it",
        list: [
          "To provide the service you requested: authentication, lessons, progress, streaks, the item shop and Ads likes (performance of our agreement with you).",
          "To keep the service safe: rate limiting, abuse detection, moderation and the handling of reports (legitimate interest and legal obligation).",
          "To send study reminders, streak alerts and account notices — only where you have enabled notifications, and always adjustable in Profile (consent).",
          "To send a limited number of emails: a welcome message, account and security notices, streak milestones and, once a month between the 1st and the 7th, a trilingual letter inviting voluntary feedback and support for Education Hugo. Every non-essential email can be switched off with the email setting in Profile; security and account notices remain (consent and legitimate interest).",
        ],
        p: ["We do not use your data for advertising, we do not build marketing profiles, and we do not make decisions producing legal effects about you by automated means alone."],
      },
      {
        h: "4. Service providers",
        p: ["We rely on a small number of processors, each bound to handle data only on our instructions:"],
        list: [
          "MongoDB Atlas (database), Render (application server), Vercel (web hosting) and Cloudflare (network delivery and protection).",
          "Google, solely for sign-in when you choose it.",
          "Resend (with an SMTP relay as fallback), which delivers our emails; it receives your email address and the message content only.",
          "Browser push services operated by Apple, Google or Mozilla, which relay notifications to your device.",
          "Telegram, which delivers internal alerts to our administrators; alerts never contain your email address.",
        ],
      },
      {
        h: "5. Third-party content in Ads",
        p: [
          "Link previews are built in your browser from the address itself. When a post contains an image link, the image is loaded directly from the server that hosts it; YouTube is contacted only when you press play, through its privacy-enhanced domain. Those third parties may therefore receive your IP address under their own policies. Hugo stores only the text and the address, never a copy of the media.",
        ],
      },
      {
        h: "6. Retention",
        list: [
          "Account, Persona and learning data are kept for as long as your account exists.",
          "Inbox notifications are deleted automatically after 90 days; security records after 180 days; anonymous performance metrics after 30 days.",
          "Likes on administrator notices remain until you remove them or delete your account.",
          "Survey answers and feedback history are kept for as long as your account exists, so that you can always consult them.",
          "When you delete your account, your personal data is erased or irreversibly anonymised, save for what the law obliges us to retain.",
        ],
      },
      {
        h: "7. Your rights",
        p: [
          `You may access, correct or delete your personal data, request a copy of it in a portable format, withdraw consent to notifications, and object to or restrict certain processing. Most controls live in Profile; you can delete your Education Hugo account and all its learning data under Settings → "Delete Education Hugo account" (your Hugo Studio sign-in account is deleted separately in Hugo Studio's account settings), and any other request may be sent to ${CONTACT}. We will respond within the time limits set by law and may first verify your identity.`,
        ],
      },
      {
        h: "8. Learners under 18",
        p: [
          "Education Hugo is intended for people aged 14 and over. A learner aged 14–15 must provide a parent or guardian phone number and confirm permission; this number is private and used only to evidence or verify guardian involvement and to handle safety or data-rights requests. We never disclose a minor's real identity publicly. A parent or guardian may contact us to review or delete the minor's data.",
        ],
      },
      {
        h: "9. Storage on your device",
        p: [
          "We use a strictly necessary session cookie to keep you signed in, and the browser's local storage for conveniences such as your language, sound preference, your place in a lesson and guest progress. We use no advertising or cross-site tracking cookies, so no cookie consent banner is required for them.",
        ],
      },
      {
        h: "10. Security and transfers",
        p: [
          "Data travels encrypted over HTTPS and is stored with access controls and audit logging. Because our providers operate internationally, data may be processed outside Vietnam; we rely only on providers that offer appropriate safeguards. No system is invulnerable, and should a breach affect you we will notify you and the competent authority as the law requires.",
        ],
      },
      {
        h: "11. Changes",
        p: ["We will announce material changes to this Policy within the service before they take effect. The date at the top shows the latest revision."],
      },
    ],
  },

  guidelines: {
    title: "User Conduct Guidelines",
    lead: "These Guidelines apply to profile information, lesson feedback, support requests and other information you submit to Education Hugo. They form part of the Terms of Use.",
    sections: [
      {
        h: "Be kind and constructive",
        list: [
          "Keep feedback about the lesson or the problem, never about a person. Courteous wording helps us act on it faster.",
          "Harassment, bullying, threats, hate speech and discrimination on any ground are prohibited.",
        ],
      },
      {
        h: "Keep it safe and appropriate",
        list: [
          "No sexual content, graphic violence, content encouraging self-harm, or anything unsuitable for a community that includes learners aged 14 and over.",
          "Do not post anyone's personal information — real names, addresses, telephone numbers, email addresses or photographs — without their explicit consent, and never your own sensitive data.",
          "Nicknames, characters and introductions must not be offensive, misleading or impersonate another person or organisation.",
        ],
      },
      {
        h: "Be honest",
        list: [
          "Do not cheat on quizzes, automate submissions or exploit defects to inflate gems, XP or streaks, and do not trade store items for money.",
          "Do not include pirated material or links to malware or phishing in anything you submit.",
          "No spam, advertising, referral schemes or repeated identical submissions.",
        ],
      },
      {
        h: "Reporting and enforcement",
        p: [
          "If you see something that breaches these Guidelines, contact us or use the feedback form. Every report is kept confidential and reviewed by people.",
          "Depending on severity and recurrence, we may reset a nickname or character, revoke illegitimate rewards, or suspend or close an account.",
        ],
      },
    ],
  },
};

const VI = {
  terms: {
    title: "Điều khoản sử dụng",
    lead: "Điều khoản này điều chỉnh việc bạn sử dụng Education Hugo — dịch vụ học tập miễn phí do Hugo Studio vận hành tại education.hugowishpax.studio. Khi tạo tài khoản hoặc tiếp tục sử dụng dịch vụ, bạn chấp nhận toàn bộ Điều khoản. Nếu không đồng ý, vui lòng không sử dụng Education Hugo.",
    sections: [
      { h: "1. Chúng tôi là ai", p: [
        "Education Hugo là dự án học tập cộng đồng miễn phí do Hugo Studio vận hành. Dự án không thu học phí hay phí truy cập và có thể nhận khoản ủng hộ tự nguyện để duy trì hoạt động. Dự án có tài khoản, máy chủ và dữ liệu riêng. Bạn có thể đăng nhập bằng Google, bằng tài khoản Hugo Studio (www.hugowishpax.studio) hoặc bằng passkey; đăng nhập bằng Hugo Studio chỉ chia sẻ cho chúng tôi tên, email và ảnh đại diện, không kèm dữ liệu nào khác của Hugo Studio.",
        "Education Hugo do Hugo, sinh viên Đại học Greenwich (Việt Nam), lên ý tưởng và xây dựng như một dự án phi lợi nhuận đóng góp cho cộng đồng. Mã nguồn, bài học, nhân vật và hình ảnh thuộc quyền của tác giả, trừ khi ghi khác; không sao chép hay đăng lại khi chưa được phép.",
        `Mọi câu hỏi về Điều khoản xin gửi tới ${CONTACT}.`,
      ] },
      { h: "2. Điều kiện sử dụng", p: [
        "Bạn phải từ đủ 14 tuổi để có tài khoản. Người học 14–15 tuổi phải cung cấp số điện thoại cha mẹ hoặc người giám hộ hợp pháp và xác nhận đã được cho phép tạo tài khoản. Người học 16–17 tuổi vẫn nên sử dụng dịch vụ với sự biết và đồng ý của cha mẹ hoặc người giám hộ.",
        "Mỗi người chỉ được có một tài khoản, không tạo tài khoản thay người khác và không mạo danh bất kỳ ai.",
      ] },
      { h: "3. Tài khoản của bạn", p: [
        "Bạn đăng nhập bằng Google hoặc bằng khoá truy cập (Face ID, vân tay hoặc mã PIN của thiết bị). Bạn có trách nhiệm giữ an toàn thiết bị và thông tin đăng nhập, và chịu trách nhiệm cho mọi hoạt động dưới tài khoản của mình. Hãy báo ngay cho chúng tôi nếu nghi ngờ có truy cập trái phép.",
        "Khoá học và tài khoản đều miễn phí, tài khoản không hết hạn. Chúng tôi có thể đóng tài khoản vi phạm Điều khoản này.",
      ] },
      { h: "4. Ngọc, XP và chuỗi lửa", p: [
        "Ngọc, XP, chuỗi lửa, mốc thưởng và thứ hạng thi đua là tính năng tạo động lực trong dịch vụ. Chúng không có giá trị tiền tệ, không quy đổi được thành tiền mặt và không tạo ra quyền sở hữu nào. Quy tắc của chúng do máy chủ của chúng tôi tính toán, và có thể được điều chỉnh để giữ công bằng.",
        "Mọi hành vi kiếm Ngọc, XP hoặc tiến độ bằng tự động hoá, nộp bài bằng script, khai thác lỗi hay thông đồng đều bị cấm. Chúng tôi có thể thu hồi số dư có được trái phép và tạm khoá các tài khoản liên quan.",
      ] },
      { h: "5. Cửa hàng vật phẩm", p: [
        "Bạn có thể đổi Ngọc lấy vật phẩm trong Cửa hàng. Mỗi vật phẩm có tác dụng ngay khi mua thành công: huy hiệu được đeo lên thẻ thành viên và hồ sơ công khai; Nhân đôi XP nhân đôi XP thi đua trong số giờ ghi trên vật phẩm, mua thêm thì cộng dồn vào thời gian còn lại; Khiên lửa tự phá băng ngày bạn lỡ học vào 8 giờ sáng hôm sau, giữ tối đa năm khiên. Giá, số lượng còn lại và mô tả được hiển thị trước khi bạn xác nhận.",
        "Vật phẩm thuộc về cá nhân bạn, không chuyển nhượng, bán lại hay đổi thành tiền. Giao dịch đã hoàn tất là cuối cùng; nếu vì lý do kỹ thuật mà vật phẩm không áp dụng được, giao dịch bị huỷ và Ngọc được hoàn tự động. Chúng tôi có thể đổi giá, ngừng bán hoặc thay đổi số lượng bất cứ lúc nào mà không ảnh hưởng tới vật phẩm bạn đang có.",
      ] },
      { h: "6. Nội dung khoá học và sở hữu trí tuệ", p: [
        "Bài học, trắc nghiệm, hình minh hoạ, nhân vật, mã nguồn mẫu và bản thân giáo trình là tác phẩm của Hugo Studio và được bảo hộ quyền tác giả. Ảnh thực tế trong bài được dùng theo giấy phép Creative Commons ghi công ngay dưới mỗi ảnh, và công cụ SQLite chạy bài tập SQL thuộc phạm vi công cộng. Bạn được dùng nội dung để tự học; không được cào, đăng lại, bán hoặc sao chép có hệ thống khi chưa có văn bản cho phép.",
        "Mã bạn viết khi làm theo bài học thuộc về bạn. Tài nguyên của bên thứ ba được dùng theo giấy phép riêng và được ghi công tại nơi xuất hiện (ví dụ phong cách nhân vật pixel của DiceBear theo CC0, hoạt cảnh lửa “Spiro Streak” theo CC BY 4.0).",
      ] },
      { h: "7. Ads và dữ liệu người dùng nhập", p: [
        "Trang Ads chỉ hiển thị chương trình, sự kiện và thông báo do quản trị viên Education Hugo đăng. Người học không thể đăng bài, bình luận hay kết bạn; chỉ có thể xem và thêm hoặc bỏ lượt thích.",
        "Thông tin bạn gửi qua hồ sơ, góp ý bài học hoặc biểu mẫu hỗ trợ phải hợp pháp, chính xác và không chứa dữ liệu cá nhân của người khác khi chưa được phép.",
      ] },
      { h: "8. Kiểm duyệt và xử lý vi phạm", p: [
        "Thông tin hồ sơ, góp ý và yêu cầu hỗ trợ có thể được rà soát để bảo vệ dịch vụ và người học. Thông báo của Admin có thể được sửa hoặc gỡ bất cứ lúc nào.",
        "Vi phạm nghiêm trọng hoặc lặp lại có thể dẫn tới đặt lại biệt danh hoặc nhân vật, thu hồi Ngọc/XP có được trái phép, hoặc tạm khoá hay chấm dứt tài khoản. Khi có thể, chúng tôi sẽ cho bạn biết đã xử lý gì và vì sao.",
      ] },
      { h: "9. Tính sẵn sàng và thay đổi", p: [
        "Education Hugo chạy trên hạ tầng gói miễn phí và được cung cấp “nguyên trạng” và “trong phạm vi sẵn có”. Chúng tôi cố gắng duy trì liên tục nhưng không bảo đảm dịch vụ không gián đoạn hay không lỗi, và một số tính năng có thể tạm giảm khi hết hạn mức miễn phí.",
        "Chúng tôi có thể sửa, thêm hoặc ngừng tính năng và sửa đổi Điều khoản. Thay đổi quan trọng sẽ được thông báo trong dịch vụ trước khi có hiệu lực; tiếp tục sử dụng sau đó nghĩa là bạn chấp nhận.",
      ] },
      { h: "10. Trách nhiệm", p: [
        "Trong phạm vi tối đa pháp luật cho phép, Hugo Studio không chịu trách nhiệm về thiệt hại gián tiếp hay hệ quả phát sinh từ việc bạn sử dụng hoặc không thể sử dụng dịch vụ. Không điều gì trong Điều khoản này loại trừ trách nhiệm mà pháp luật không cho loại trừ, hay hạn chế quyền luật định của bạn với tư cách người tiêu dùng.",
      ] },
      { h: "11. Luật áp dụng", p: [
        "Điều khoản này được điều chỉnh bởi pháp luật nước Cộng hoà Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp trước hết được giải quyết bằng thương lượng; nếu không thành, tranh chấp được đưa ra toà án có thẩm quyền tại Việt Nam.",
      ] },
    ],
  },
  privacy: {
    title: "Chính sách quyền riêng tư",
    lead: "Chính sách này giải thích Education Hugo xử lý dữ liệu cá nhân nào, vì sao, chia sẻ với ai và bạn kiểm soát chúng thế nào. Chúng tôi chỉ thu thập những gì dịch vụ thật sự cần, không bao giờ bán dữ liệu cá nhân hay hiển thị quảng cáo hành vi của bên thứ ba.",
    sections: [
      { h: "1. Bên kiểm soát dữ liệu", p: [
        `Hugo Studio là bên kiểm soát dữ liệu cá nhân được mô tả ở đây. Yêu cầu liên quan tới dữ liệu của bạn xin gửi tới ${CONTACT}. Chúng tôi xử lý dữ liệu cá nhân theo pháp luật Việt Nam về bảo vệ dữ liệu cá nhân, gồm Luật Bảo vệ dữ liệu cá nhân 2025 (hiệu lực từ 01/01/2026), Nghị định 13/2023/NĐ-CP và văn bản thay thế (nếu có).`,
      ] },
      { h: "2. Dữ liệu chúng tôi xử lý", list: [
        "Dữ liệu tài khoản — email và tên hiển thị từ đăng nhập Google; với khoá truy cập: khoá công khai và tên thiết bị (dữ liệu sinh trắc học không bao giờ rời khỏi thiết bị của bạn).",
        "Danh tính hồ sơ (Persona) — biệt danh, nhân vật pixel và lời giới thiệu ngắn. Các thông tin này được dùng trong tài khoản của bạn; tên thật, email và ảnh của bạn không hiển thị trên trang Ads.",
        "Dữ liệu học tập — step và bài đã học, câu trả lời và điểm trắc nghiệm, lịch chuỗi lửa, XP, mục tiêu ngày và cài đặt cá nhân. Bài tập SQL chạy hoàn toàn trong trình duyệt; những gì bạn gõ ở đó chỉ lưu nháp trên thiết bị của bạn và không bao giờ gửi về chúng tôi.",
        "Dữ liệu Cửa hàng — vật phẩm đã mua, huy hiệu đang đeo, số Khiên lửa và thời gian Nhân đôi XP còn lại, cùng các giao dịch Ngọc đã thanh toán.",
        "Phản hồi — điểm và góp ý của bạn trong khảo sát Education Hugo, các báo cáo và yêu cầu hỗ trợ bạn gửi; bạn xem lại được tất cả ở Hồ sơ › Lịch sử phản hồi.",
        "Dữ liệu tương tác — lượt thích bạn đặt trên thông báo của Admin. Với người học 14–15 tuổi, chúng tôi còn lưu số điện thoại cha mẹ/người giám hộ và xác nhận đã được cho phép.",
        "Dữ liệu thiết bị và thông báo — đăng ký nhận thông báo đẩy kèm ngôn ngữ thiết bị, thông báo trong hộp thư, và bản ghi bảo mật kỹ thuật như địa chỉ IP và user agent dùng để phát hiện lạm dụng.",
        "Số đo hiệu năng — số đo tốc độ trang và lỗi ẩn danh, không chứa định danh nào của bạn.",
      ] },
      { h: "3. Vì sao chúng tôi xử lý", list: [
        "Để cung cấp dịch vụ bạn yêu cầu: đăng nhập, bài học, tiến độ, chuỗi lửa, Cửa hàng và lượt thích Ads (thực hiện thoả thuận với bạn).",
        "Để giữ an toàn cho dịch vụ: giới hạn tần suất, phát hiện lạm dụng, kiểm duyệt và xử lý báo cáo (lợi ích chính đáng và nghĩa vụ pháp lý).",
        "Để gửi nhắc học, cảnh báo chuỗi lửa và thông báo tài khoản — chỉ khi bạn bật thông báo, và luôn chỉnh được trong Hồ sơ (sự đồng ý).",
        "Để gửi một số ít email: thư chào mừng, thông báo tài khoản và bảo mật, mốc chuỗi lửa, và mỗi tháng một lần trong khoảng ngày 01–07, một lá thư ba ngôn ngữ mời bạn tự nguyện góp ý và ủng hộ Education Hugo. Mọi email không thiết yếu đều tắt được bằng công tắc email trong Hồ sơ; thông báo bảo mật và tài khoản vẫn được gửi (sự đồng ý và lợi ích chính đáng).",
      ], p: ["Chúng tôi không dùng dữ liệu của bạn cho quảng cáo, không lập hồ sơ tiếp thị và không đưa ra quyết định có hệ quả pháp lý đối với bạn chỉ bằng phương tiện tự động."] },
      { h: "4. Nhà cung cấp dịch vụ", p: ["Chúng tôi dùng một số ít bên xử lý, mỗi bên chỉ được xử lý dữ liệu theo chỉ dẫn của chúng tôi:"], list: [
        "MongoDB Atlas (cơ sở dữ liệu), Render (máy chủ ứng dụng), Vercel (lưu trữ web) và Cloudflare (phân phối và bảo vệ mạng).",
        "Google, chỉ cho việc đăng nhập khi bạn chọn.",
        "Resend (kèm máy chủ SMTP dự phòng) để gửi email; bên này chỉ nhận địa chỉ email của bạn và nội dung thư.",
        "Dịch vụ thông báo đẩy của trình duyệt do Apple, Google hoặc Mozilla vận hành, chuyển thông báo tới thiết bị của bạn.",
        "Telegram, chuyển cảnh báo nội bộ tới quản trị viên; cảnh báo không bao giờ chứa email của bạn.",
      ] },
      { h: "5. Nội dung bên thứ ba trong Ads", p: [
        "Bản xem trước liên kết được dựng trong trình duyệt của bạn từ chính địa chỉ đó. Khi bài đăng có liên kết ảnh, ảnh được tải trực tiếp từ máy chủ lưu nó; YouTube chỉ được gọi khi bạn bấm phát, qua tên miền tăng cường quyền riêng tư. Vì vậy các bên thứ ba này có thể nhận địa chỉ IP của bạn theo chính sách riêng của họ. Hugo chỉ lưu chữ và địa chỉ, không bao giờ lưu bản sao nội dung đa phương tiện.",
      ] },
      { h: "6. Thời hạn lưu trữ", list: [
        "Dữ liệu tài khoản, Persona và học tập được lưu chừng nào tài khoản còn tồn tại.",
        "Thông báo trong hộp thư tự xoá sau 90 ngày; bản ghi bảo mật sau 180 ngày; số đo hiệu năng ẩn danh sau 30 ngày.",
        "Lượt thích trên thông báo của Admin được giữ đến khi bạn bỏ thích hoặc xoá tài khoản.",
        "Câu trả lời khảo sát và lịch sử phản hồi được giữ chừng nào tài khoản còn tồn tại, để bạn luôn xem lại được.",
        "Khi bạn xoá tài khoản, dữ liệu cá nhân được xoá hoặc ẩn danh không thể khôi phục, trừ phần pháp luật buộc chúng tôi lưu giữ.",
      ] },
      { h: "7. Quyền của bạn", p: [
        `Bạn có quyền truy cập, chỉnh sửa hoặc xoá dữ liệu cá nhân, yêu cầu bản sao ở định dạng có thể chuyển, rút lại sự đồng ý nhận thông báo, và phản đối hoặc hạn chế một số hoạt động xử lý. Phần lớn công cụ nằm trong Hồ sơ; bạn tự xoá tài khoản Education Hugo cùng toàn bộ dữ liệu học ở Cài đặt → "Xoá tài khoản Education Hugo" (tài khoản đăng nhập Hugo Studio xoá riêng trong phần cài đặt của Hugo Studio), và mọi yêu cầu khác xin gửi tới ${CONTACT}. Chúng tôi trả lời trong thời hạn luật định và có thể xác minh danh tính của bạn trước.`,
      ] },
      { h: "8. Người học dưới 18 tuổi", p: [
        "Education Hugo dành cho người từ 14 tuổi. Người học 14–15 tuổi phải cung cấp số điện thoại cha mẹ/người giám hộ và xác nhận đã được cho phép; số này là dữ liệu riêng tư, chỉ dùng để chứng minh hoặc xác minh sự tham gia của người giám hộ và xử lý yêu cầu an toàn hoặc quyền dữ liệu. Chúng tôi không công khai danh tính thật của người chưa thành niên. Cha mẹ hoặc người giám hộ có thể liên hệ để xem lại hoặc xoá dữ liệu của trẻ.",
      ] },
      { h: "9. Lưu trữ trên thiết bị của bạn", p: [
        "Chúng tôi dùng một cookie phiên thật sự cần thiết để giữ bạn đăng nhập, và bộ nhớ cục bộ của trình duyệt cho những tiện ích như ngôn ngữ, âm thanh, vị trí đang học, khoá học đang chọn, nháp bài tập SQL và tiến độ khi học thử. Chúng tôi không dùng cookie quảng cáo hay theo dõi xuyên trang, nên không cần hộp thoại xin đồng ý cookie cho chúng.",
      ] },
      { h: "10. Bảo mật và chuyển dữ liệu", p: [
        "Dữ liệu được mã hoá khi truyền qua HTTPS và được lưu với kiểm soát truy cập và nhật ký kiểm tra. Vì các nhà cung cấp hoạt động quốc tế, dữ liệu có thể được xử lý ngoài Việt Nam; chúng tôi chỉ dùng nhà cung cấp có biện pháp bảo vệ phù hợp. Không hệ thống nào bất khả xâm phạm; nếu sự cố ảnh hưởng tới bạn, chúng tôi sẽ thông báo cho bạn và cơ quan có thẩm quyền theo quy định.",
      ] },
      { h: "11. Thay đổi", p: ["Thay đổi quan trọng của Chính sách sẽ được thông báo trong dịch vụ trước khi có hiệu lực. Ngày ở đầu trang là lần sửa gần nhất."] },
    ],
  },
  guidelines: {
    title: "Quy tắc sử dụng",
    lead: "Quy tắc này áp dụng cho thông tin hồ sơ, góp ý bài học, yêu cầu hỗ trợ và mọi thông tin bạn gửi tới Education Hugo. Quy tắc là một phần của Điều khoản sử dụng.",
    sections: [
      { h: "Tử tế và mang tính xây dựng", list: [
        "Góp ý về bài học hoặc vấn đề, đừng nhắm vào cá nhân. Lời lẽ lịch sự giúp chúng tôi xử lý nhanh hơn.",
        "Cấm quấy rối, bắt nạt, đe doạ, phát ngôn thù ghét và phân biệt đối xử dưới mọi hình thức.",
      ] },
      { h: "An toàn và phù hợp", list: [
        "Không nội dung tình dục, bạo lực ghê rợn, nội dung khuyến khích tự gây hại, hay bất cứ gì không phù hợp với một cộng đồng có người học từ 14 tuổi.",
        "Không đăng thông tin cá nhân của người khác — tên thật, địa chỉ, số điện thoại, email hay ảnh — khi chưa có sự đồng ý rõ ràng của họ, và không bao giờ đăng dữ liệu nhạy cảm của chính bạn.",
        "Biệt danh, nhân vật và lời giới thiệu không được xúc phạm, gây hiểu lầm hay mạo danh người hoặc tổ chức khác.",
      ] },
      { h: "Trung thực", list: [
        "Không gian lận trắc nghiệm, tự động nộp bài hay khai thác lỗi để thổi phồng Ngọc, XP hoặc chuỗi lửa, và không mua bán vật phẩm Cửa hàng bằng tiền.",
        "Không gửi nội dung vi phạm bản quyền hay liên kết tới mã độc, lừa đảo.",
        "Không spam, quảng cáo, chương trình giới thiệu hay gửi lặp lại cùng một nội dung.",
      ] },
      { h: "Báo cáo và xử lý", p: [
        "Nếu thấy điều gì vi phạm Quy tắc, hãy liên hệ chúng tôi hoặc dùng mẫu góp ý. Mọi báo cáo đều được giữ kín và do người thật xem xét.",
        "Tuỳ mức độ và tần suất, chúng tôi có thể đặt lại biệt danh hoặc nhân vật, thu hồi phần thưởng trái phép, hoặc tạm khoá hay đóng tài khoản.",
      ] },
    ],
  },
};

const ZH = {
  terms: {
    title: "使用条款",
    lead: "本条款适用于你使用 Education Hugo——由 Hugo Studio 在 education.hugowishpax.studio 运营的免费学习服务。创建账户或继续使用本服务，即表示你完全接受本条款。如不同意，请勿使用 Education Hugo。",
    sections: [
      { h: "1. 我们是谁", p: [
        "Education Hugo 是由 Hugo Studio 运营的免费社区学习项目，不收取学费或访问费，并可接受用于维持项目的自愿捐助。项目拥有独立的账户、服务器和数据。你可以使用 Google、Hugo Studio 账户（www.hugowishpax.studio）或通行密钥登录；使用 Hugo Studio 登录时，我们只会获得你的姓名、邮箱和头像，不会获得 Hugo Studio 的其他数据。",
        "Education Hugo 由格林威治大学（越南）学生 Hugo 构思并开发，是一个回馈社区的非营利项目。除另有说明外，源代码、课程、角色和美术作品归作者所有；未经许可不得复制或转载。",
        `有关本条款的问题，请发送至 ${CONTACT}。`,
      ] },
      { h: "2. 使用资格", p: [
        "你必须年满 14 周岁才能拥有账户。14–15 岁学员必须提供父母或法定监护人的电话号码，并确认监护人已允许创建账户。16–17 岁学员仍应在父母或监护人知情的情况下使用服务。",
        "每人只能拥有一个账户，不得替他人创建账户，也不得冒充任何人。",
      ] },
      { h: "3. 你的账户", p: [
        "你可以使用 Google 或通行密钥（Face ID、指纹或设备 PIN）登录。你有责任保护能访问账户的设备和凭据，并对账户下的所有活动负责。如怀疑有未经授权的访问，请立即通知我们。",
        "课程和账户均免费，账户不会过期。对于违反本条款的账户，我们可以将其关闭。",
      ] },
      { h: "4. 宝石、XP 与连胜", p: [
        "宝石、XP、连胜、里程碑和排行名次是服务内的激励功能，不具有货币价值，不能兑换现金，也不产生任何所有权。其规则仅由我们的服务器计算，我们可为维护公平而调整。",
        "禁止通过自动化、脚本提交、利用漏洞或串通等方式获取 宝石、XP 或进度。我们可收回不正当获得的余额并暂停相关账户。",
      ] },
      { h: "5. 道具商店", p: [
        "你可以在商店用 宝石 兑换道具。道具在购买成功后立即生效：徽章会佩戴在会员卡和公开主页上；双倍 XP 在标明的小时数内使排行 XP 翻倍，再次购买会累加剩余时间；火焰护盾会在你漏学后的次日早上 8 点自动为那一天破冰，最多同时持有五个。确认前会显示价格、库存和说明。",
        "道具归你个人所有，不得转让、转售或兑换成金钱。已完成的购买为最终交易；若因技术原因道具无法生效，购买将被取消并自动退还 宝石。我们可随时调整价格、下架道具或更改库存，但不影响你已拥有的道具。",
      ] },
      { h: "6. 课程内容与知识产权", p: [
        "课程、测验、插图、角色、示例源代码及课程体系本身均为 Hugo Studio 的作品，受著作权保护。课程中的实景照片依据每张照片下方注明的知识共享许可使用，运行 SQL 练习的 SQLite 引擎属于公有领域。你可将内容用于个人学习；未经书面许可，不得抓取、转载、出售或系统性复制。",
        "你在跟随课程时编写的代码归你所有。第三方素材按其各自许可使用，并在出现处注明（例如 DiceBear 的像素角色风格采用 CC0，“Spiro Streak”火焰动画采用 CC BY 4.0）。",
      ] },
      { h: "7. Ads 与用户输入", p: [
        "Ads 页面仅包含由 Education Hugo 管理员发布的项目、活动与通知。学员不能发布帖子、评论或好友请求，只能查看通知并点赞或取消点赞。",
        "你通过个人资料、课程反馈或支持表单提交的信息必须合法、准确，未经许可不得包含他人的个人信息。",
      ] },
      { h: "8. 审核与处理", p: [
        "个人资料、反馈和支持请求可能会被审核，以保护服务和学员。管理员通知可随时更正或移除。",
        "严重或屡次违规可能导致重置昵称或角色、收回不正当获得的 宝石 或 XP，或暂停、终止账户。在可行时，我们会告知你所采取的措施及原因。",
      ] },
      { h: "9. 可用性与变更", p: [
        "Education Hugo 运行在免费层基础设施上，按“现状”和“现有”提供。我们力求服务连续，但不保证不中断或无错误；免费额度用尽时，部分功能可能暂时降级。",
        "我们可以修改、新增或撤回功能并修订本条款。重大变更会在生效前于服务内公告；此后继续使用即表示接受。",
      ] },
      { h: "10. 责任", p: [
        "在法律允许的最大范围内，Hugo Studio 不对因你使用或无法使用本服务而产生的间接或后果性损失负责。本条款不排除依法不得排除的责任，也不限制你作为消费者享有的法定权利。",
      ] },
      { h: "11. 适用法律", p: [
        "本条款受越南社会主义共和国法律管辖。任何争议应首先友好协商解决；协商不成的，提交越南有管辖权的法院处理。",
      ] },
    ],
  },
  privacy: {
    title: "隐私政策",
    lead: "本政策说明 Education Hugo 处理哪些个人数据、为何处理、与谁共享，以及你如何控制这些数据。我们只收集服务真正需要的数据，从不出售个人数据，也不展示第三方行为广告。",
    sections: [
      { h: "1. 数据控制者", p: [
        `Hugo Studio 是本文所述个人数据的控制者。有关你数据的请求请发送至 ${CONTACT}。我们依据越南有关个人数据保护的法律处理个人数据，包括《2025 年个人数据保护法》（2026 年 1 月 1 日起施行）、第 13/2023/NĐ-CP 号法令及其后续法规。`,
      ] },
      { h: "2. 我们处理的数据", list: [
        "账户数据——来自 Google 登录的电子邮箱和显示名称；使用通行密钥时，为公钥和设备名称（生物特征本身从不离开你的设备）。",
        "个人资料身份（Persona）——昵称、像素角色和简短介绍。这些信息用于你自己的账户；真实姓名、邮箱和照片不会显示在 Ads 页面。",
        "学习数据——已完成的 step 和课程、测验答案与分数、连胜日历、XP、每日目标和个人设置。SQL 练习完全在你的浏览器中运行；你在其中输入的内容仅作为草稿保存在你的设备上，绝不会发送给我们。",
        "商店数据——你购买的道具、佩戴的徽章、剩余的火焰护盾和双倍 XP 时间，以及相应的 宝石 交易记录。",
        "反馈——你在 Education Hugo 问卷中的评分和意见，以及你提交的举报和支持请求；你可在“个人资料 › 反馈记录”中查看全部内容。",
        "互动数据——你对管理员通知添加的点赞。对于 14–15 岁学员，我们还保存父母或监护人电话号码及学员已获许可的确认。",
        "设备与通知数据——附带设备语言的推送订阅、收件箱中的通知，以及用于发现滥用的技术安全记录，如 IP 地址和用户代理。",
        "性能指标——不含任何个人标识的匿名页面速度和错误数据。",
      ] },
      { h: "3. 处理目的", list: [
        "提供你所请求的服务：登录、课程、进度、连胜、商店和 Ads 点赞（履行与你的约定）。",
        "保障服务安全：频率限制、滥用检测、内容审核和举报处理（正当利益和法定义务）。",
        "发送学习提醒、连胜提醒和账户通知——仅在你开启通知时发送，并可随时在个人资料中调整（同意）。",
        "发送少量电子邮件：欢迎信、账户与安全通知、连胜里程碑，以及每月 1 日至 7 日之间一封三语信件，邀请你自愿提供反馈并支持 Education Hugo。所有非必要邮件都可通过个人资料中的邮件开关关闭；安全和账户通知仍会发送（同意和正当利益）。",
      ], p: ["我们不将你的数据用于广告，不建立营销画像，也不会仅凭自动化手段作出对你产生法律效果的决定。"] },
      { h: "4. 服务提供方", p: ["我们依赖少数处理方，每一方都只能按照我们的指示处理数据："], list: [
        "MongoDB Atlas（数据库）、Render（应用服务器）、Vercel（网页托管）和 Cloudflare（网络分发与防护）。",
        "Google，仅在你选择时用于登录。",
        "Resend（以 SMTP 中继作为备用）负责发送邮件，只接收你的邮箱地址和邮件内容。",
        "由 Apple、Google 或 Mozilla 运营的浏览器推送服务，将通知转发到你的设备。",
        "Telegram，向我们的管理员发送内部提醒；提醒绝不包含你的邮箱。",
      ] },
      { h: "5. Ads 中的第三方内容", p: [
        "链接预览由你的浏览器根据链接地址本身生成。帖子包含图片链接时，图片直接从其托管服务器加载；只有在你点击播放时才会通过隐私增强域名连接 YouTube。因此这些第三方可能依据其自身政策获得你的 IP 地址。Hugo 只保存文字和地址，从不保存媒体副本。",
      ] },
      { h: "6. 保存期限", list: [
        "账户、Persona 和学习数据在账户存在期间一直保存。",
        "收件箱通知在 90 天后自动删除；安全记录在 180 天后删除；匿名性能指标在 30 天后删除。",
        "管理员通知上的点赞会保留到你取消点赞或删除账户。",
        "问卷答案和反馈记录在账户存在期间一直保存，方便你随时查看。",
        "你删除账户后，个人数据将被删除或不可逆地匿名化，法律要求我们保留的除外。",
      ] },
      { h: "7. 你的权利", p: [
        `你可以访问、更正或删除个人数据，索取可携带格式的副本，撤回对通知的同意，并反对或限制某些处理。大部分控制项位于个人资料中；你可以在 设置 →「删除 Education Hugo 账户」中删除 Education Hugo 账户及全部学习数据（Hugo Studio 登录账户需在 Hugo Studio 账户设置中另行删除），其他请求可发送至 ${CONTACT}。我们将在法定期限内答复，并可能先核实你的身份。`,
      ] },
      { h: "8. 未满 18 岁的学员", p: [
        "Education Hugo 面向 14 岁及以上人群。14–15 岁学员必须提供父母或监护人电话号码并确认已获许可；该号码为私密数据，仅用于证明或核实监护人参与，以及处理安全或数据权利请求。我们绝不公开未成年人的真实身份。父母或监护人可联系我们查看或删除未成年人的数据。",
      ] },
      { h: "9. 存储在你设备上的数据", p: [
        "我们使用一个严格必要的会话 Cookie 来保持你的登录状态，并使用浏览器本地存储保存语言、声音偏好、学习位置、所选课程、SQL 练习草稿和访客进度等便利信息。我们不使用广告或跨站跟踪 Cookie，因此无需为此弹出 Cookie 同意提示。",
      ] },
      { h: "10. 安全与跨境传输", p: [
        "数据通过 HTTPS 加密传输，并在访问控制和审计日志下存储。由于服务提供方在国际范围内运营，数据可能在越南境外处理；我们只选用具备适当保护措施的提供方。没有任何系统坚不可摧；如发生影响你的数据泄露，我们将依法通知你和主管机关。",
      ] },
      { h: "11. 变更", p: ["本政策的重大变更将在生效前于服务内公告。页首日期为最近一次修订日期。"] },
    ],
  },
  guidelines: {
    title: "用户行为准则",
    lead: "本准则适用于个人资料信息、课程反馈、支持请求以及你提交给 Education Hugo 的其他信息，是使用条款的组成部分。",
    sections: [
      { h: "友善且具建设性", list: [
        "反馈请针对课程或问题本身，而不是针对个人。礼貌的措辞能帮助我们更快处理。",
        "禁止骚扰、欺凌、威胁、仇恨言论和任何形式的歧视。",
      ] },
      { h: "安全且得体", list: [
        "不得发布色情内容、血腥暴力、鼓励自我伤害的内容，或任何不适合包含 14 岁以上学员的社区的内容。",
        "未经本人明确同意，不得发布他人的个人信息——真实姓名、地址、电话、邮箱或照片——也绝不要发布你自己的敏感数据。",
        "昵称、角色和简介不得具有冒犯性、误导性，或冒充其他个人或组织。",
      ] },
      { h: "诚实守信", list: [
        "不得在测验中作弊、自动提交或利用漏洞刷 宝石、XP 或连胜，也不得用金钱交易商店道具。",
        "提交的任何内容中不得包含盗版内容或指向恶意软件、钓鱼网站的链接。",
        "禁止垃圾信息、广告、推荐计划或重复提交相同内容。",
      ] },
      { h: "举报与处理", p: [
        "如发现违反本准则的内容，请联系我们或使用反馈表。每份举报都会保密并由人工审核。",
        "视严重程度和频率，我们可能重置昵称或角色、收回不正当奖励，或暂停、关闭账户。",
      ] },
    ],
  },
};

/** Văn bản theo ngôn ngữ giao diện (mặc định tiếng Anh nếu thiếu). */
// Quy định đối tác — điều kiện cấp key thư viện step (education-hugo-react, REST API).
// Khớp với hệ thống thật: key 32 ký tự, băm SHA-256, hạn ≤ 365 ngày, khoá tên miền, đếm lượt, thu hồi được.
EN.partners = {
  title: "Partner Policy",
  lead: "Hugo Studio is a system of personal projects developed by Hugo Wishpax Le. The step library (education-hugo-react and the lesson REST API) is offered free of charge to partners approved under this Policy. Applying does not create any right to a key: every application is reviewed individually and Hugo Studio may accept or decline it at its sole discretion.",
  sections: [
    {
      h: "1. Who may apply",
      p: ["A partnership is approved only when all of the following conditions are met:"],
      list: [
        "The applicant is at least 18 years of age and has full legal capacity to enter into an agreement. An applicant acting for an organisation must be authorised to represent it.",
        "The applicant already operates an organisational or personal project or system (a school, centre, club, product or website) into which the lessons will be integrated, and describes it in the application email.",
        "The application email states the period for which the library will be used, with a start date and an end date.",
      ],
    },
    {
      h: "2. How to apply",
      p: [`Send an email to ${CONTACT} with the subject “Education Hugo partner key”, including:`],
      list: [
        "Your full name, date of birth, and — for an organisation — its name and your role in it.",
        "A description of your project or system, with links (website, repository, introduction) or attachments.",
        "The domain(s) that will call the library, including any development domain such as http://localhost:5173.",
        "The requested period of use (from … to …), not exceeding 365 days per key.",
      ],
    },
    {
      h: "3. Your key",
      list: [
        "If approved, a 32-character key is sent once to the email you applied from. Hugo Studio stores only a hash of it and cannot show it again.",
        "The key is valid for the approved period only and is locked to the registered domains; calls from any other domain are refused. Each use is recorded (number of uses, most recent use).",
        "The key is personal to the approved partner. Do not sell, share, publish or transfer it. Report a leaked key immediately so it can be revoked and replaced.",
        "To extend the period or add a domain, email us before the key expires.",
      ],
    },
    {
      h: "4. Use of the content",
      list: [
        "The lessons are written by Education Hugo. You may display them only through the library or the API, with the Education Hugo attribution intact.",
        "You may not copy, store, export, translate, resell or redistribute the lessons outside the library, or present them as your own work.",
        "You may customise only the design tokens documented on the Developers page; the layout, mascots and lesson text may not be altered.",
        "Learner progress stays in each learner's browser. You are responsible for your own learners' data and for complying with the law that applies to your project.",
      ],
    },
    {
      h: "5. Suspension and revocation",
      p: [
        "Hugo Studio may suspend or revoke a key at any time, without prior notice, if this Policy is breached, if the information in the application proves false, or if the library is used in a way that harms learners or Hugo Studio. A key also stops working automatically when its period ends.",
        "The library and API are provided free of charge and “as is”, without any guarantee of availability. Hugo Studio may change or discontinue them, and may amend this Policy; the current version is always published on this page.",
      ],
    },
    {
      h: "6. Contact",
      p: [`Questions about this Policy or about an application: ${CONTACT}.`],
    },
  ],
};
VI.partners = {
  title: "Quy định đối tác",
  lead: "Hugo Studio là hệ thống dự án cá nhân do Hugo Wishpax Le phát triển. Thư viện step (education-hugo-react và REST API bài học) được cấp miễn phí cho đối tác được chấp thuận theo Quy định này. Gửi đơn không đồng nghĩa với việc được cấp key: mỗi đơn được xét riêng, Hugo Studio toàn quyền chấp thuận hoặc từ chối.",
  sections: [
    {
      h: "1. Điều kiện được chấp thuận",
      p: ["Đối tác chỉ được chấp thuận khi đáp ứng đủ cả ba điều kiện sau:"],
      list: [
        "Từ đủ 18 tuổi trở lên và có đầy đủ năng lực hành vi dân sự để tự xác lập, thực hiện thoả thuận. Người đứng đơn thay mặt tổ chức phải là người có thẩm quyền đại diện tổ chức đó.",
        "Đã có hệ thống dự án của tổ chức hoặc dự án cá nhân (trường, trung tâm, câu lạc bộ, sản phẩm, website) để tích hợp bài học, và đính kèm thông tin dự án trong mail.",
        "Trong mail phải thông báo rõ thời gian xin sử dụng, gồm ngày bắt đầu và ngày kết thúc.",
      ],
    },
    {
      h: "2. Cách gửi đơn",
      p: [`Gửi mail tới ${CONTACT} với tiêu đề “Xin key đối tác Education Hugo”, gồm:`],
      list: [
        "Họ tên, ngày sinh; nếu là tổ chức thì ghi tên tổ chức và vai trò của bạn.",
        "Mô tả hệ thống / dự án kèm đường dẫn (website, kho mã, bài giới thiệu) hoặc tệp đính kèm.",
        "Tên miền sẽ gọi thư viện, kể cả tên miền phát triển như http://localhost:5173.",
        "Thời gian xin sử dụng (từ … đến …), tối đa 365 ngày cho mỗi key.",
      ],
    },
    {
      h: "3. Key của bạn",
      list: [
        "Nếu được chấp thuận, key 32 ký tự được gửi một lần duy nhất tới email đã gửi đơn. Hugo Studio chỉ lưu bản băm, không xem lại được key gốc.",
        "Key chỉ có hiệu lực trong thời gian được duyệt và bị khoá theo tên miền đã đăng ký; gọi từ tên miền khác sẽ bị từ chối. Mỗi lượt dùng đều được ghi nhận (số lượt, lần dùng gần nhất).",
        "Key thuộc riêng đối tác được duyệt. Không bán, chia sẻ, công khai hay chuyển nhượng. Lộ key thì báo ngay để thu hồi và cấp key mới.",
        "Muốn gia hạn hoặc thêm tên miền, gửi mail trước khi key hết hạn.",
      ],
    },
    {
      h: "4. Sử dụng nội dung",
      list: [
        "Bài học do Education Hugo tự biên soạn. Chỉ được hiển thị qua thư viện hoặc API, giữ nguyên ghi công Education Hugo.",
        "Không sao chép, lưu trữ, xuất ra, dịch, bán lại hay phân phối lại bài học ngoài thư viện, và không nhận là sản phẩm của mình.",
        "Chỉ được tuỳ biến các token giao diện ghi trên trang Nhà phát triển; không đổi bố cục, mascot hay chữ bài học.",
        "Tiến độ học viên nằm trong trình duyệt của học viên. Đối tác tự chịu trách nhiệm về dữ liệu học viên của mình và tuân thủ pháp luật áp dụng cho dự án của mình.",
      ],
    },
    {
      h: "5. Tạm ngưng và thu hồi",
      p: [
        "Hugo Studio có thể tạm ngưng hoặc thu hồi key bất cứ lúc nào, không cần báo trước, khi đối tác vi phạm Quy định này, thông tin trong đơn không đúng sự thật, hoặc thư viện bị dùng theo cách gây hại cho học viên hay cho Hugo Studio. Key cũng tự ngừng khi hết thời hạn.",
        "Thư viện và API được cung cấp miễn phí và “nguyên trạng”, không cam kết luôn hoạt động. Hugo Studio có thể thay đổi, ngừng cung cấp, hoặc sửa Quy định này; bản hiện hành luôn đăng tại trang này.",
      ],
    },
    {
      h: "6. Liên hệ",
      p: [`Thắc mắc về Quy định hoặc về đơn: ${CONTACT}.`],
    },
  ],
};
ZH.partners = {
  title: "合作伙伴规定",
  lead: "Hugo Studio 是由 Hugo Wishpax Le 开发的个人项目体系。课程步骤库（education-hugo-react 与课程 REST API）免费提供给依本规定获批的合作伙伴。提交申请并不等于获得密钥：每份申请单独审核，Hugo Studio 有权自行决定批准或拒绝。",
  sections: [
    {
      h: "1. 获批条件",
      p: ["须同时满足以下全部条件方可获批："],
      list: [
        "年满 18 周岁，具有完全民事行为能力，能够独立订立协议。代表机构申请的，须为有权代表该机构的人。",
        "已有机构项目或个人项目（学校、培训中心、社团、产品或网站）用于集成课程，并在邮件中附上项目信息。",
        "邮件中须写明申请使用的期限，包括开始日期和结束日期。",
      ],
    },
    {
      h: "2. 如何申请",
      p: [`发送邮件至 ${CONTACT}，主题为“Education Hugo 合作伙伴密钥”，内容包括：`],
      list: [
        "姓名、出生日期；机构申请须写明机构名称及你的职务。",
        "项目或系统的介绍，附链接（网站、代码仓库、介绍页）或附件。",
        "将调用库的域名，包括开发域名，例如 http://localhost:5173。",
        "申请使用期限（从……到……），每个密钥最长 365 天。",
      ],
    },
    {
      h: "3. 你的密钥",
      list: [
        "获批后，32 位密钥仅发送一次至申请邮箱。Hugo Studio 只保存其哈希值，无法再次查看原密钥。",
        "密钥仅在获批期限内有效，并绑定已登记的域名；来自其他域名的调用将被拒绝。每次使用都会被记录（次数、最近一次使用）。",
        "密钥仅归获批合作伙伴所有，不得出售、分享、公开或转让。密钥泄露请立即告知，以便吊销并重新签发。",
        "如需延期或增加域名，请在密钥到期前发邮件联系。",
      ],
    },
    {
      h: "4. 内容使用",
      list: [
        "课程由 Education Hugo 自行编写，只能通过库或 API 展示，并须保留 Education Hugo 署名。",
        "不得在库之外复制、存储、导出、翻译、转售或再分发课程，也不得将其冒充为自己的作品。",
        "只能自定义开发者页面列出的界面令牌；不得修改布局、吉祥物或课程文字。",
        "学员进度保存在学员自己的浏览器中。合作伙伴自行负责其学员数据，并遵守其项目适用的法律。",
      ],
    },
    {
      h: "5. 暂停与吊销",
      p: [
        "如违反本规定、申请信息不实，或库的使用方式损害学员或 Hugo Studio，Hugo Studio 可随时暂停或吊销密钥，无需事先通知。密钥到期后也会自动失效。",
        "库与 API 免费并按“现状”提供，不保证持续可用。Hugo Studio 可修改或停止提供，并可修订本规定；现行版本始终发布在本页面。",
      ],
    },
    {
      h: "6. 联系方式",
      p: [`关于本规定或申请的问题：${CONTACT}。`],
    },
  ],
};

export const LEGAL_BY_LANG = { en: EN, vi: VI, zh: ZH };
export const legalFor = (lang) => LEGAL_BY_LANG[lang] || EN;
