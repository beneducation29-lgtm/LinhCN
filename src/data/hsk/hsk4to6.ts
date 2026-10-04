import { HskLevelProfile, VocabItem, GrammarPattern, TopicDefinition } from './types';

// =================== HSK 4 ===================
export const hsk4Profile: HskLevelProfile = {
  level: 'HSK 4',
  title: 'Trung cấp Nâng cao · Khá',
  badgeLabel: 'Khá',
  wordCount: 1200,
  description: 'Thảo luận lưu loát về các chủ đề giáo dục, công nghệ, nghề nghiệp, văn hóa và giải quyết vấn đề.',
  communicationGoals: [
    'Trình bày quan điểm có giải thích nguyên nhân và so sánh các giải pháp',
    'Thảo luận về cơ hội nghề nghiệp, ảnh hưởng của giáo dục đối với giới trẻ',
    'Sử dụng các liên từ chuyển ý phức tạp (不仅...而且..., 无论...都...)',
  ],
  difficultyProfile: 'Câu ghép đa mệnh đề, vốn từ trừu tượng về giáo dục và công nghệ.',
  responseLength: 'detailed',
  recommendedResponseLength: '2-4 câu có giải thích quan điểm và gợi mở tranh luận nhẹ',
  conversationStyle: 'Trao đổi sâu sắc, cô Linh sẽ khích lệ bạn đưa ra lập luận cá nhân và so sánh thực tế tại Việt Nam và các nước.',
  defaultOpeningQuestion: {
    chinese: '你好！我们今天来探讨一个很有深度的话题：你认为现代教育对年轻人的思维方式有什么重要的影响？',
    pinyin: 'Nǐ hǎo! Wǒmen jīntiān lái tàntǎo yí gè hěn yǒu shēndù de huàtí: Nǐ rènwéi xiàndài jiàoyù duì niánqīngrén de sīwéi fāngshì yǒu shénme zhòngyào de yǐngxiǎng?',
    vietnamese: 'Chào bạn! Hôm nay chúng ta hãy thảo luận một chủ đề sâu sắc: Bạn nghĩ nền giáo dục hiện đại có ảnh hưởng quan trọng nào đến tư duy của người trẻ?',
  },
  sampleTopicsSummary: 'Ảnh hưởng của giáo dục đối với người trẻ, Công nghệ trong đời sống, Áp lực công việc',
};

export const hsk4Vocab: VocabItem[] = [
  {
    id: 'hsk4-jiaoyu',
    word: '教育',
    pinyin: 'jiàoyù',
    meaningVi: 'giáo dục',
    partOfSpeech: 'noun',
    partOfSpeechLabel: '名词/动词 · Danh từ / Động từ',
    hskLevel: 'HSK 4',
    topic: 'education-youth',
    topicNameVi: 'Giáo dục & Giới trẻ',
    exampleChinese: '良好的家庭教育对孩子的性格有深远的影响。',
    examplePinyin: 'Liánghǎo de jiātíng jiàoyù duì háizi de xìnggé yǒu shēnyuǎn de yǐngxiǎng.',
    exampleVietnamese: 'Giáo dục gia đình tốt đẹp có ảnh hưởng sâu sắc đến tính cách của trẻ.',
    commonCollocations: ['现代教育 (giáo dục hiện đại)', '接受教育 (tiếp nhận giáo dục)'],
    difficulty: 'medium',
    status: 'learned',
  },
  {
    id: 'hsk4-yingxiang',
    word: '影响',
    pinyin: 'yǐngxiǎng',
    meaningVi: 'ảnh hưởng, tác động',
    partOfSpeech: 'noun',
    partOfSpeechLabel: '名词/动词 · Danh từ / Động từ',
    hskLevel: 'HSK 4',
    topic: 'education-youth',
    topicNameVi: 'Giáo dục & Giới trẻ',
    exampleChinese: '科技的发展深刻地改变并影响着我们的生活方式。',
    examplePinyin: 'Kējì de fāzhǎn shēnkè de gǎibiàn bìng yǐngxiǎng zhe wǒmen de shēnghuó fāngshì.',
    exampleVietnamese: 'Sự phát triển của khoa học công nghệ làm thay đổi sâu sắc và tác động lên lối sống của chúng ta.',
    commonCollocations: ['有深远的影响 (có ảnh hưởng sâu xa)', '受到影响 (chịu ảnh hưởng)'],
    difficulty: 'medium',
    status: 'learning',
  },
  {
    id: 'hsk4-jishu',
    word: '技术',
    pinyin: 'jìshù',
    meaningVi: 'công nghệ, kỹ thuật',
    partOfSpeech: 'noun',
    partOfSpeechLabel: '名词 · Danh từ',
    hskLevel: 'HSK 4',
    topic: 'education-youth',
    topicNameVi: 'Giáo dục & Giới trẻ',
    exampleChinese: '现代数字技术让自主学习变得更加高效。',
    examplePinyin: 'Xiàndài shùzì jìshù ràng zìzhǔ xuéxí biàn de gèngjiā gāoxiào.',
    exampleVietnamese: 'Công nghệ số hiện đại giúp việc tự học trở nên hiệu quả hơn nhiều.',
    commonCollocations: ['科学技术 (khoa học kỹ thuật)', '技术水平 (trình độ kỹ thuật)'],
    difficulty: 'medium',
    status: 'mastered',
  },
  {
    id: 'hsk4-jiaoliu',
    word: '交流',
    pinyin: 'jiāoliú',
    meaningVi: 'giao lưu, trao đổi',
    partOfSpeech: 'verb',
    partOfSpeechLabel: '动词 · Động từ',
    hskLevel: 'HSK 4',
    topic: 'education-youth',
    topicNameVi: 'Giao tiếp & Xã hội',
    exampleChinese: '与母语者交流是提升外语流利度的最好途径。',
    examplePinyin: 'Yǔ mǔyǔzhě jiāoliú shì tíshēng wàiyǔ liúlìdù de zuì hǎo tújìng.',
    exampleVietnamese: 'Giao lưu cùng người bản ngữ là con đường tốt nhất để nâng cao độ lưu loát ngoại ngữ.',
    commonCollocations: ['文化交流 (giao lưu văn hóa)', '互相交流 (trao đổi lẫn nhau)'],
    difficulty: 'medium',
    status: 'learning',
  },
];

export const hsk4Grammar: GrammarPattern[] = [
  {
    id: 'g-hsk4-bujin',
    name: 'Liên từ tăng tiến: 不仅...而且... (Không những... mà còn...)',
    level: 'HSK 4',
    pattern: 'Chủ ngữ + 不仅 + Vế 1, 而且 + Vế 2',
    explanation: 'Biểu thị ý nghĩa bổ sung và tăng cấp độ so với vế trước.',
    examples: [
      {
        chinese: '学习外语不仅能开阔眼界，而且能提供更多工作机会。',
        pinyin: 'Xuéxí wàiyǔ bùjǐn néng kāikuò yǎnjiè, érqiě néng tígōng gèng duō gōngzuò jīhuì.',
        vietnamese: 'Học ngoại ngữ không những mở rộng tầm mắt mà còn mang lại nhiều cơ hội nghề nghiệp hơn.',
      },
    ],
  },
];

export const hsk4Topics: TopicDefinition[] = [
  {
    id: 'education-youth-hsk4',
    title: 'Ảnh hưởng của giáo dục đối với người trẻ',
    titleZh: '教育对年轻人的影响',
    subtitle: 'Thảo luận về cơ hội, tư duy phản biện và định hướng tương lai',
    level: 'HSK 4',
    description: 'Bình luận về vai trò của trường đại học, việc tự học trực tuyến và áp lực thi cử đối với thanh niên hiện đại.',
    steps: [
      {
        stepNumber: 1,
        name: 'Góc nhìn ban đầu',
        objective: 'Nêu nhận định chung về giáo dục hiện nay',
        samplePromptZh: '你认为现在的年轻人接受高等教育最重要的收获是什么？',
        samplePromptPinyin: 'Nǐ rènwéi xiànzài de niánqīngrén jiēshòu gāoděng jiàoyù zuì zhòngyào de shōuhuò shì shénme?',
        samplePromptVi: 'Bạn nghĩ thu hoạch quan trọng nhất của người trẻ khi học đại học ngày nay là gì?',
      },
      {
        stepNumber: 2,
        name: 'Kỹ năng mềm vs Kiến thức',
        objective: 'So sánh giữa lý thuyết và kỹ năng thực hành',
        samplePromptZh: '在未来的职场中，你觉得专业知识更重要，还是沟通交流能力更关键？',
        samplePromptPinyin: 'Zài wèilái de zhíchǎng zhōng, nǐ juéde zhuānyè zhīshi gèng zhòngyào, háishì gōutōng jiāoliú nénglì gèng guānjiàn?',
        samplePromptVi: 'Trong môi trường làm việc tương lai, bạn thấy kiến thức chuyên ngành hay năng lực giao tiếp quan trọng hơn?',
      },
      {
        stepNumber: 3,
        name: 'Tự học và Công nghệ',
        objective: 'Ảnh hưởng của mạng Internet và trí tuệ nhân tạo',
        samplePromptZh: '网络和AI工具对你的自主学习带来了哪些便利或者挑战？',
        samplePromptPinyin: 'Wǎngluò hé AI gōngjù duì nǐ de zìzhǔ xuéxí dàilái le nǎxiē biànlì huòzhě tiǎozhàn?',
        samplePromptVi: 'Internet và các công cụ AI đã mang lại những thuận tiện hay thách thức nào cho việc tự học của bạn?',
      },
      {
        stepNumber: 4,
        name: 'Áp lực học tập',
        objective: 'Chia sẻ về cách cân bằng tâm lý và giải tỏa căng thẳng',
        samplePromptZh: '面对激烈的竞争，现在的年轻人应该如何调整自己的心理状态？',
        samplePromptPinyin: 'Miànduì jīliè de jìngzhēng, xiànzài de niánqīngrén yīnggāi rúhé tiáozhěng zìjǐ de xīnlǐ zhuàngtài?',
        samplePromptVi: 'Đối diện với sự cạnh tranh khốc liệt, người trẻ ngày nay nên điều chỉnh trạng thái tâm lý thế nào?',
      },
      {
        stepNumber: 5,
        name: 'Định hướng tương lai',
        objective: 'Tổng kết tầm nhìn cá nhân',
        samplePromptZh: '如果有机会，你最希望在哪个领域继续深入学习和发展？',
        samplePromptPinyin: 'Rúguǒ yǒu jīhuì, nǐ zuì xīwàng zài nǎ gè lǐngyù jìxù shēnrù xuéxí hé fāzhǎn?',
        samplePromptVi: 'Nếu có cơ hội, bạn mong muốn tiếp tục học tập và phát triển sâu trong lĩnh vực nào nhất?',
      },
    ],
    keyVocabulary: ['教育', '影响', '技术', '交流'],
    targetGrammar: ['g-hsk4-bujin'],
    questionPool: [
      {
        id: 'q4-1',
        type: 'opening',
        step: 1,
        chinese: '你认为现在的年轻人接受高等教育最重要的收获是什么？',
        pinyin: 'Nǐ rènwéi xiànzài de niánqīngrén jiēshòu gāoděng jiàoyù zuì zhòngyào de shōuhuò shì shénme?',
        vietnamese: 'Bạn nghĩ thu hoạch quan trọng nhất của người trẻ khi học đại học ngày nay là gì?',
      },
    ],
  },
];

// =================== HSK 5 ===================
export const hsk5Profile: HskLevelProfile = {
  level: 'HSK 5',
  title: 'Cao cấp Thực chiến · Nâng cao',
  badgeLabel: 'Nâng cao',
  wordCount: 2500,
  description: 'Thuyết trình, phân tích vấn đề kinh tế, xã hội, thách thức của giáo dục hiện đại và lập luận logic.',
  communicationGoals: [
    'Bình luận chuyên sâu về các vấn đề thời sự, xu hướng công nghệ',
    'Sử dụng phong phú thành ngữ và quán dụng ngữ',
    'Trình bày lập luận sắc sảo và đưa giải pháp đa chiều',
  ],
  difficultyProfile: 'Cấu trúc tu từ, văn ngôn giản lược, từ vựng học thuật phong phú.',
  responseLength: 'extended',
  recommendedResponseLength: 'Phân tích đa chiều, dẫn chứng thực tế, phản biện logic',
  conversationStyle: 'Đối thoại học thuật và chuyên gia, cô Linh sẽ cùng bạn trao đổi sâu về cơ chế và giải pháp.',
  defaultOpeningQuestion: {
    chinese: '你好！今天我们讨论一个备受关注的话题：在知识爆炸的时代，现代教育体制面临的最大挑战是什么？',
    pinyin: 'Nǐ hǎo! Jīntiān wǒmen tǎolùn yí gè bèishòu guānzhù de huàtí: Zài zhīshi bàozhà de shídài, xiàndài jiàoyù tǐzhì miànlín de zuì dà tiǎozhàn shì shénme?',
    vietnamese: 'Chào bạn! Hôm nay chúng ta cùng thảo luận một chủ đề được quan tâm lớn: Trong kỷ nguyên bùng nổ tri thức, thách thức lớn nhất mà nền giáo dục hiện đại đang đối mặt là gì?',
  },
  sampleTopicsSummary: 'Thách thức giáo dục hiện đại, Xu thế việc làm tương lai, Trí tuệ cảm xúc',
};

export const hsk5Vocab: VocabItem[] = [
  {
    id: 'hsk5-tiaozhan',
    word: '挑战',
    pinyin: 'tiǎozhàn',
    meaningVi: 'thách thức, thử thách',
    partOfSpeech: 'noun',
    partOfSpeechLabel: '名词/动词 · Danh từ / Động từ',
    hskLevel: 'HSK 5',
    topic: 'modern-challenges-hsk5',
    topicNameVi: 'Thách thức hiện đại',
    exampleChinese: '传统课堂模式正面临来自在线教育的巨大挑战。',
    examplePinyin: 'Chuántǒng kètáng móshì zhèng miànlín láizì zàixiàn jiàoyù de jùdà tiǎozhàn.',
    exampleVietnamese: 'Mô hình lớp học truyền thống đang đối mặt với thử thách to lớn đến từ giáo dục trực tuyến.',
    commonCollocations: ['面临挑战 (đối mặt thách thức)', '巨大的挑战 (thách thức to lớn)'],
    difficulty: 'hard',
    status: 'learning',
  },
];

export const hsk5Grammar: GrammarPattern[] = [
  {
    id: 'g-hsk5-congjiedu',
    name: 'Cấu trúc lập luận: 从...角度来看 (Xét từ góc độ...)',
    level: 'HSK 5',
    pattern: '从 + [Khía cạnh/Đối tượng] + 角度来看, [Nhận định/Đánh giá]',
    explanation: 'Dùng để mở ra một góc nhìn khách quan hoặc đa chiều trong nghị luận.',
    examples: [
      {
        chinese: '从终身学习的角度来看，培养自学能力远比死记硬背重要。',
        pinyin: 'Cóng zhōngshēn xuéxí de jiǎodù lái kàn, péiyǎng zìxué nénglì yuǎn bǐ sǐjì yìngbèi zhòngyào.',
        vietnamese: 'Xét từ góc độ học tập suốt đời, bồi dưỡng năng lực tự học quan trọng hơn nhiều so với việc học vẹt.',
      },
    ],
  },
];

export const hsk5Topics: TopicDefinition[] = [
  {
    id: 'modern-challenges-hsk5',
    title: 'Những thách thức của giáo dục hiện đại',
    titleZh: '现代教育面临的挑战',
    subtitle: 'Thảo luận về tính công bằng, sự lỗi thời của chương trình và vai trò người thầy',
    level: 'HSK 5',
    description: 'Phân tích sự biến đổi của vai trò người thầy khi học sinh có thể tiếp cận mọi thông tin chỉ sau một cú nhấp chuột.',
    steps: [
      {
        stepNumber: 1,
        name: 'Nhận diện thách thức',
        objective: 'Chỉ ra mâu thuẫn lớn nhất trong giáo dục ngày nay',
        samplePromptZh: '你认为现代教育面临的最严峻挑战是什么？',
        samplePromptPinyin: 'Nǐ rènwéi xiàndài jiàoyù miànlín de zuì yánjùn tiǎozhàn shì shénme?',
        samplePromptVi: 'Bạn cho rằng thách thức nghiêm trọng nhất của giáo dục hiện đại là gì?',
      },
      {
        stepNumber: 2,
        name: 'Vai trò người thầy',
        objective: 'Bình luận về sự thay đổi của giáo viên',
        samplePromptZh: '当AI能回答几乎所有问题时，教师的核心价值应该是什么？',
        samplePromptPinyin: 'Dāng AI néng huídá jīhū suǒyǒu wèntí shí, jiàoshī de héxīn jiàzhí yīnggāi shì shénme?',
        samplePromptVi: 'Khi AI có thể trả lời hầu hết mọi câu hỏi, giá trị cốt lõi của người giáo viên nên là gì?',
      },
      {
        stepNumber: 3,
        name: 'Đề xuất giải pháp',
        objective: 'Gợi mở hướng đổi mới giáo dục',
        samplePromptZh: '为了适应未来的变化，学校课程应该做出哪些革新？',
        samplePromptPinyin: 'Wèile shìyìng wèilái de biànhuà, xuéxiào kèchéng yīnggāi zuòchū nǎxiē géxīn?',
        samplePromptVi: 'Để thích ứng với những biến đổi tương lai, chương trình học nên có những cải cách nào?',
      },
      {
        stepNumber: 4,
        name: 'Công bằng xã hội',
        objective: 'Khoảng cách công nghệ giữa các vùng miền',
        samplePromptZh: '数字化教育会不会加剧城乡之间的教育资源不平等？',
        samplePromptPinyin: 'Shùzìhuà jiàoyù huì bu huì jiājù chéngxiāng zhījiān de jiàoyù zīyuán bù píngděng?',
        samplePromptVi: 'Giáo dục số hóa liệu có làm gia tăng sự bất bình đẳng tài nguyên giáo dục giữa thành thị và nông thôn?',
      },
      {
        stepNumber: 5,
        name: 'Tầm nhìn thế kỷ 21',
        objective: 'Định nghĩa một nền giáo dục lý tưởng',
        samplePromptZh: '在你心中，真正理想的未来教育模式是什么样的？',
        samplePromptPinyin: 'Zài nǐ xīn zhōng, zhēnzhèng lǐxiǎng de wèilái jiàoyù móshì shì shénmeyàng de?',
        samplePromptVi: 'Trong tâm trí bạn, một mô hình giáo dục tương lai thực sự lý tưởng sẽ như thế nào?',
      },
    ],
    keyVocabulary: ['挑战'],
    targetGrammar: ['g-hsk5-congjiedu'],
    questionPool: [
      {
        id: 'q5-1',
        type: 'opening',
        step: 1,
        chinese: '你认为现代教育体制面临的最大挑战是什么？',
        pinyin: 'Nǐ rènwéi xiàndài jiàoyù tǐzhì miànlín de zuì dà tiǎozhàn shì shénme?',
        vietnamese: 'Bạn cho rằng thách thức lớn nhất của thể chế giáo dục hiện đại là gì?',
      },
    ],
  },
];

// =================== HSK 6 ===================
export const hsk6Profile: HskLevelProfile = {
  level: 'HSK 6',
  title: 'Thành thạo Bản ngữ · Chuyên gia',
  badgeLabel: 'Thành thạo',
  wordCount: 5000,
  description: 'Tiếp nhận và truyền đạt thông tin dễ dàng bằng tiếng Trung hàn lâm, diễn đạt tinh tế, lập luận triết học và đàm phán cấp cao.',
  communicationGoals: [
    'Tranh biện và bình luận lưu loát tương đương người bản ngữ có học thức',
    'Hiểu các sắc thái ẩn dụ, hàm ý văn hóa và ngôn ngữ văn chương',
    'Thảo luận đa chiều về tác động của trí tuệ nhân tạo đối với nền văn minh nhân loại',
  ],
  difficultyProfile: 'Tiếng Trung hàn lâm, thuật ngữ chuyên ngành sâu, cấu trúc câu đa tầng.',
  responseLength: 'extended',
  recommendedResponseLength: 'Văn phong triết lý, tự nhiên, giàu liên tưởng và phản biện học thuật',
  conversationStyle: 'Đẳng cấp chuyên gia bản xứ, đối thoại khai phóng và mở rộng tư duy đỉnh cao.',
  defaultOpeningQuestion: {
    chinese: '您好！今天我们来深入探讨科技哲学的前沿命题：人工智能究竟在多大程度上重新定义了人类知识的本质与教育的终极目的？',
    pinyin: 'Nín hǎo! Jīntiān wǒmen lái shēnrù tàntǎo kējì zhéxué de qiányán mìngtí: Réngōng zhìnéng jiūjìng zài duō dà chéngdù shàng chóngxīn dìngyì le rénlèi zhīshi de běnzhì yǔ jiàoyù de zhōngjí mùdì?',
    vietnamese: 'Xin chào bạn! Hôm nay chúng ta cùng đào sâu một mệnh đề triết học công nghệ: Trí tuệ nhân tạo tái định nghĩa bản chất tri thức và mục đích tối hậu của giáo dục ở mức độ nào?',
  },
  sampleTopicsSummary: 'AI thay đổi giáo dục, Bản chất tri thức nhân loại, Giao lưu văn hóa số',
};

export const hsk6Vocab: VocabItem[] = [
  {
    id: 'hsk6-rengongzhineng',
    word: '人工智能',
    pinyin: 'réngōng zhìnéng',
    meaningVi: 'trí tuệ nhân tạo (AI)',
    partOfSpeech: 'noun',
    partOfSpeechLabel: '名词 · Danh từ',
    hskLevel: 'HSK 6',
    topic: 'ai-education-hsk6',
    topicNameVi: 'Trí tuệ nhân tạo & Tương lai',
    exampleChinese: '生成式人工智能正在从根本上重塑传统学术研究范式。',
    examplePinyin: 'Shēngchéngshì réngōng zhìnéng zhèngzài cóng gēnběn shàng chóngshù chuántǒng xuéshù yánjiū fànshì.',
    exampleVietnamese: 'AI tạo sinh đang tái định hình tận gốc rễ mô hình nghiên cứu học thuật truyền thống.',
    commonCollocations: ['重塑范式 (tái định hình mô hình)', '赋能教育 (tiếp sức cho giáo dục)'],
    difficulty: 'hard',
    status: 'learning',
  },
];

export const hsk6Grammar: GrammarPattern[] = [
  {
    id: 'g-hsk6-guigengjiedi',
    name: 'Cụm liên từ đúc kết: 归根结底 (Suy cho cùng / Rốt cuộc)',
    level: 'HSK 6',
    pattern: '归根结底, [Luận điểm cốt lõi/Bản chất]',
    explanation: 'Dùng để kết luận một chuỗi các luận cứ phức tạp về bản chất gốc rễ.',
    examples: [
      {
        chinese: '技术无论多么先进，教育归根结底是一棵树摇动另一棵树、一个灵魂唤醒另一个灵魂的过程。',
        pinyin: 'Jìshù wúlùn duōme xiānjìn, jiàoyù guīgēn-jiédǐ shì yì kē shù yáodòng lìng yì kē shù, yí gè línghún huànxǐng lìng yí gè línghún de guòchéng.',
        vietnamese: 'Cho dù công nghệ có tiên tiến đến đâu, giáo dục suy cho cùng vẫn là một cái cây lay động một cái cây khác, một tâm hồn đánh thức một tâm hồn khác.',
      },
    ],
  },
];

export const hsk6Topics: TopicDefinition[] = [
  {
    id: 'ai-education-hsk6',
    title: 'AI thay đổi giáo dục như thế nào',
    titleZh: '人工智能如何改变教育',
    subtitle: 'Bản chất của việc học tập trong kỷ nguyên AI tự động hóa',
    level: 'HSK 6',
    description: 'Thảo luận sâu về việc cá nhân hóa lộ trình học tập, tính xác thực của nghiên cứu và sự gắn kết nhân văn.',
    steps: [
      {
        stepNumber: 1,
        name: 'Định nghĩa lại tri thức',
        objective: 'Bình luận về sự thay đổi của việc tiếp thu kiến thức',
        samplePromptZh: '当机器拥有超越常人的记忆与计算力，人类究竟该学习什么？',
        samplePromptPinyin: 'Dāng jīqì yōngyǒu chāoyuè chángrén de jìyì yǔ jìsuànlì, rénlèi jiūjìng gāi xuéxí shénme?',
        samplePromptVi: 'Khi máy móc sở hữu trí nhớ và khả năng tính toán vượt trội con người, nhân loại rốt cuộc nên học điều gì?',
      },
      {
        stepNumber: 2,
        name: 'Sáng tạo và Trực giác',
        objective: 'Khám phá ranh giới độc bản của con người',
        samplePromptZh: '审美鉴赏力、同理心与批判性思维，能否成为人类独有的护城河？',
        samplePromptPinyin: 'Shěnměi jiànshǎnglì, tónglǐxīn yǔ pīpànxìng sīwéi, néng fǒu chéngwéi rénlèi dúyǒu de hùchénghé?',
        samplePromptVi: 'Khả năng thẩm mỹ, sự đồng cảm và tư duy phản biện liệu có thể trở thành con hào phòng thủ độc bản của con người?',
      },
      {
        stepNumber: 3,
        name: 'Đạo đức và Liêm chính',
        objective: 'Thách thức liêm chính học thuật',
        samplePromptZh: '如何防止技术滥用导致的学术造假与思维惰性？',
        samplePromptPinyin: 'Rúhé fángzhǐ jìshù lànyòng dǎozhì de xuéshù zàojiǎ yǔ sīwéi duòxìng?',
        samplePromptVi: 'Làm thế nào để ngăn chặn sự lạm dụng công nghệ dẫn tới gian lận học thuật và sự lười biếng tư duy?',
      },
      {
        stepNumber: 4,
        name: 'Cá nhân hóa tột cùng',
        objective: 'Mỗi học sinh một gia sư AI như Linh',
        samplePromptZh: '千人千面的个性化教育，是否会彻底取代标准化的大班教学？',
        samplePromptPinyin: 'Qiān rén qiān miàn de gèxìnghuà jiàoyù, shìfǒu huì chèdǐ qǔdài biāozhǔnhuà de dàbān jiàoxué?',
        samplePromptVi: 'Giáo dục cá nhân hóa ngàn người ngàn vẻ liệu có thay thế hoàn toàn hình thức giảng dạy đại trà?',
      },
      {
        stepNumber: 5,
        name: 'Ý nghĩa nhân bản',
        objective: 'Đúc kết triết lý giáo dục',
        samplePromptZh: '在未来的智能文明中，您如何定义一名优秀学者的精神品格？',
        samplePromptPinyin: 'Zài wèilái de zhìnéng wénmíng zhōng, nín rúhé dìngyì yì míng yōuxiù xuézhě de jīngshén pǐngé?',
        samplePromptVi: 'Trong nền văn minh trí tuệ tương lai, bạn định nghĩa phẩm cách tinh thần của một học giả ưu tú như thế nào?',
      },
    ],
    keyVocabulary: ['人工智能'],
    targetGrammar: ['g-hsk6-guigengjiedi'],
    questionPool: [
      {
        id: 'q6-1',
        type: 'opening',
        step: 1,
        chinese: '当机器拥有超越常人的记忆与计算力，人类究竟该学习什么？',
        pinyin: 'Dāng jīqì yōngyǒu chāoyuè chángrén de jìyì yǔ jìsuànlì, rénlèi jiūjìng gāi xuéxí shénme?',
        vietnamese: 'Khi máy móc sở hữu trí nhớ và khả năng tính toán vượt trội con người, nhân loại rốt cuộc nên học điều gì?',
      },
    ],
  },
];
