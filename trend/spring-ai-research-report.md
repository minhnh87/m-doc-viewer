# Nghiên Cứu Ứng Dụng Spring AI

**Ngày nghiên cứu:** 09/12/2025
**Phiên bản Spring AI mới nhất:** 1.1.1 (released 05/12/2025)

---

## 1. Tổng Quan

### 1.1 Spring AI là gì?

Spring AI là một dự án của Spring Team (VMware/Broadcom) được khởi động năm 2023, với phiên bản milestone đầu tiên ra mắt đầu năm 2024. **Spring AI 1.0 GA** được phát hành vào tháng 5/2025, đánh dấu sự sẵn sàng cho production.

Spring AI trừu tượng hóa các quy trình tương tác với Large Language Models (LLMs), tương tự cách Spring Data trừu tượng hóa việc truy cập database. Framework cung cấp:

- **Portable API**: Chuyển đổi giữa các AI providers mà không cần thay đổi code
- **Spring Boot Integration**: Auto-configuration và familiar patterns cho Java developers
- **Enterprise-ready**: Observability, security, và production-grade features

### 1.2 Vị Trí Trong Hệ Sinh Thái

Theo BellSoft Java Survey 2024:
- 34% developers hiện đang sử dụng AI frameworks
- 74% developers sử dụng AI tools trong workflow
- Spring AI đang trở thành **de facto standard** cho AI trong ứng dụng Java

---

## 2. Các Tính Năng Chính

### 2.1 Chat & Conversation

```java
@Autowired
private ChatClient chatClient;

public String chat(String userMessage) {
    return chatClient.prompt(userMessage)
        .call()
        .content();
}
```

**Hỗ trợ:**
- Text generation
- Multi-turn conversations
- Streaming responses
- Chat memory (stateful conversations)

### 2.2 Model Providers Được Hỗ Trợ

| Provider | Models | Đặc điểm |
|----------|--------|----------|
| **OpenAI** | GPT-4o, GPT-4, GPT-3.5 | Full API support, File API, Image generation |
| **Anthropic** | Claude 3.5, Claude 3 | Prompt caching, Extended context |
| **Google** | Gemini, Vertex AI | Multimodal embeddings |
| **Azure OpenAI** | Azure-hosted models | Enterprise compliance |
| **Ollama** | Llama, Mistral, etc. | Local/self-hosted models |
| **Amazon Bedrock** | Multiple models | AWS integration |
| **Mistral AI** | Mistral models | OCR API integration |
| **Hugging Face** | Open-source models | Flexible deployment |

### 2.3 Retrieval Augmented Generation (RAG)

RAG cho phép LLMs trả lời câu hỏi dựa trên dữ liệu riêng của doanh nghiệp.

**Architecture:**
```
[Documents] → [Text Splitter] → [Embeddings] → [Vector Store]
                                                      ↓
[User Query] → [Query Embedding] → [Similarity Search] → [Context]
                                                              ↓
                                              [LLM + Context] → [Response]
```

**Vector Stores được hỗ trợ:**
- PostgreSQL/PGVector
- MongoDB Atlas
- Redis
- Pinecone
- Qdrant
- Milvus
- Chroma
- Weaviate
- Neo4j
- Apache Cassandra
- Oracle
- Azure AI Search
- OpenSearch
- MariaDB (mới trong 1.1)
- GemFire (metadata filtering)

**Code Example:**
```java
@Autowired
private VectorStore vectorStore;

@Autowired
private ChatClient chatClient;

public String ragQuery(String query) {
    var retriever = QuestionAnswerAdvisor.builder(vectorStore)
        .searchRequest(SearchRequest.builder()
            .similarityThreshold(0.7)
            .topK(5)
            .build())
        .build();

    return chatClient.prompt(query)
        .advisors(retriever)
        .call()
        .content();
}
```

### 2.4 Function Calling / Tool Use

Function calling cho phép LLM gọi các methods Java để thực hiện actions hoặc lấy dữ liệu real-time.

```java
@Bean
@Description("Get weather information for a city")
public Function<WeatherRequest, WeatherResponse> getWeather() {
    return request -> weatherService.getWeather(request.city());
}
```

**Ứng dụng:**
- Query databases bằng natural language
- Call external APIs
- Perform calculations
- Multi-step agentic workflows

### 2.5 Model Context Protocol (MCP) - NEW in 1.1

MCP là protocol chuẩn (do Anthropic khởi xướng) cho phép AI models truy cập external tools và data sources an toàn.

**Spring AI MCP Features:**
- Annotation-based tools: `@McpTool`, `@McpResource`, `@McpPrompt`
- Multiple transports: STDIO, HTTP SSE, Streamable HTTP
- Auto-configuration với Spring Boot starters
- Docker Compose & Testcontainers integration

```java
@McpTool
public WeatherData getWeather(@Param("city") String city) {
    return weatherService.fetch(city);
}

@McpResource
public String getDatabaseSchema() {
    return schemaService.getSchema();
}
```

**Adoption:** MCP đã được hỗ trợ bởi Google, Microsoft, Nvidia và trở thành open standard cho AI agentic era.

### 2.6 Multimodal Support

- **Images**: Vision analysis, image generation (DALL-E)
- **Audio**: Text-to-Speech (TTS)
- **Documents**: PDF, OCR
- **Embeddings**: Multimodal embeddings với Google Vertex AI

### 2.7 Observability

- Micrometer integration
- Token usage tracking
- Request/response logging
- Performance metrics

---

## 3. Ứng Dụng Thực Tế (Use Cases)

### 3.1 Intelligent Customer Support

```java
@Service
public class CustomerSupportBot {
    private final ChatClient chatClient;
    private final VectorStore knowledgeBase;

    public String handleQuery(String customerQuery) {
        // RAG để lấy context từ knowledge base
        // Function calling để tra cứu order status, account info
        // Chat memory để duy trì conversation context
    }
}
```

### 3.2 Content Generation Service

- Product descriptions
- Email templates
- Marketing copy
- Documentation generation

### 3.3 Internal Document Q&A

- Policy documents search
- Technical documentation assistant
- HR FAQs automation

### 3.4 Code Assistant

- Code review suggestions
- Documentation generation
- Bug analysis

### 3.5 Data Analysis

- Natural language to SQL
- Report generation
- Anomaly detection explanations

### 3.6 Enterprise Integration

- SAP integration via MCP
- CRM automation
- ERP data queries

---

## 4. So Sánh Với Framework Khác

### 4.1 Spring AI vs LangChain4j

| Aspect | Spring AI | LangChain4j |
|--------|-----------|-------------|
| **Maturity** | Newer (GA 2025) | More mature |
| **Spring Integration** | Native | Manual configuration |
| **Design Philosophy** | Spring patterns | LangChain-inspired |
| **GitHub Stars** | ~7.2k | ~5k+ |
| **Backing** | VMware/Broadcom | Community |
| **Enterprise Support** | Official Spring support | Community |
| **Learning Curve** | Easy for Spring devs | Steeper |

**Khi nào chọn Spring AI:**
- Existing Spring Boot application
- Team familiar với Spring ecosystem
- Enterprise support cần thiết
- Need for quick integration

**Khi nào chọn LangChain4j:**
- Complex agentic workflows
- Need LangChain ecosystem compatibility
- Quarkus integration

### 4.2 Spring AI vs Python Frameworks

| Aspect | Spring AI (Java) | LangChain (Python) |
|--------|-----------------|-------------------|
| **Ecosystem Maturity** | Growing | Very mature |
| **Enterprise Integration** | Excellent | Moderate |
| **Performance** | JVM optimized | Interpreted |
| **Type Safety** | Strong | Dynamic |
| **Developer Pool** | Large (Java devs) | Large (Python devs) |

---

## 5. Architecture Best Practices

### 5.1 Configuration

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o
          temperature: 0.7
    vectorstore:
      pgvector:
        index-type: HNSW
        distance-type: COSINE
```

### 5.2 Error Handling

```java
@Service
public class RobustAIService {
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public String generateResponse(String prompt) {
        return chatClient.prompt(prompt).call().content();
    }
}
```

### 5.3 Cost Optimization

- Prompt caching (supported in 1.1)
- Token usage monitoring
- Model selection strategy
- Semantic caching for repeated queries

### 5.4 Security

- API key management via Spring Vault
- OAuth2 integration for MCP servers
- Input validation and sanitization
- Rate limiting

---

## 6. Getting Started

### 6.1 Dependencies

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.1.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-model-openai</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-vector-store-pgvector</artifactId>
    </dependency>
</dependencies>
```

### 6.2 Basic Chat Endpoint

```java
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @PostMapping
    public String chat(@RequestBody String message) {
        return chatClient.prompt(message).call().content();
    }
}
```

---

## 7. Roadmap & Future

### 7.1 Spring AI 2.x (Đang phát triển)

- Support cho Spring Boot 4 và Spring Framework 7
- Enhanced agentic AI capabilities
- Deeper MCP integration
- Performance optimizations

### 7.2 Xu hướng

- **Agentic AI**: Autonomous agents với multi-step reasoning
- **A2A Protocol**: Agent-to-Agent communication
- **Local Models**: Tăng cường hỗ trợ Ollama và local deployment
- **Multimodal**: Video và complex document processing

---

## 8. Resources

### Official

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Spring AI GitHub](https://github.com/spring-projects/spring-ai)
- [Spring AI Examples](https://github.com/spring-projects/spring-ai-examples)
- [Spring Initializr](https://start.spring.io)

### Community

- [Awesome Spring AI](https://github.com/spring-ai-community/awesome-spring-ai)
- [Spring AI Alibaba](https://github.com/alibaba/spring-ai-alibaba)
- [Java AI Dev](https://javaaidev.com/docs/spring-ai/intro/)

### Learning

- [Spring AI Tutorial - InfoWorld](https://www.infoworld.com/article/4091447/spring-ai-tutorial-get-started-with-spring-ai.html)
- [Spring Blog - AI Category](https://spring.io/blog/category/releases)

---

## 9. Kết Luận

Spring AI đã trưởng thành nhanh chóng từ một project thử nghiệm thành framework production-ready. Với version 1.1:

**Điểm mạnh:**
- Native Spring integration
- Comprehensive model provider support
- MCP protocol adoption
- Enterprise-ready features
- Active development & community

**Điểm cần cải thiện:**
- Still newer than Python alternatives
- Some advanced features still experimental
- Documentation đang được hoàn thiện

**Recommendation:**
- Cho enterprise Java applications: **Strongly recommended**
- Cho teams familiar với Spring: **Immediate adoption possible**
- Cho complex agentic workflows: Consider combining với LangChain4j

Spring AI đang định vị là bridge quan trọng giúp Java developers tham gia vào AI revolution mà không cần rời bỏ ecosystem quen thuộc.

---

*Report generated: 09/12/2025*
