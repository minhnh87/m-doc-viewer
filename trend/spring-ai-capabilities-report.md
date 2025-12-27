# Spring AI - Capabilities & Examples Report

**Research Date:** 2025-12-09
**Version Covered:** Spring AI 1.1.x (GA November 2025)

---

## Executive Summary

Spring AI is a framework that simplifies AI/ML integration for Java developers using familiar Spring patterns. It provides a unified abstraction layer across multiple AI providers, allowing developers to switch between models (OpenAI, Anthropic, Azure, etc.) without changing application code.

**Key Value Propositions:**
- Familiar Spring programming model
- Provider-agnostic API
- Enterprise-ready with Spring Boot auto-configuration
- Support for RAG, function calling, and structured outputs

---

## 1. Core Capabilities

### 1.1 Chat Completion

The most fundamental feature - interact with LLMs for text generation.

```java
@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String message) {
        return chatClient.prompt()
                .user(message)
                .call()
                .content();
    }
}
```

**Configuration (application.yml):**
```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o
          temperature: 0.7
```

---

### 1.2 Structured Output - Map AI Responses to POJOs

Convert AI text responses directly to Java objects.

```java
// Define your data model
public record MovieRecommendation(
    String title,
    int year,
    String genre,
    String reason
) {}

@Service
public class MovieService {

    private final ChatClient chatClient;

    public List<MovieRecommendation> getRecommendations(String mood) {
        return chatClient.prompt()
                .user("Recommend 3 movies for someone feeling " + mood)
                .call()
                .entity(new ParameterizedTypeReference<List<MovieRecommendation>>() {});
    }
}
```

**Result:**
```json
[
  {"title": "The Grand Budapest Hotel", "year": 2014, "genre": "Comedy", "reason": "Whimsical and uplifting"},
  {"title": "Amélie", "year": 2001, "genre": "Romance", "reason": "Charming and heartwarming"},
  {"title": "Up", "year": 2009, "genre": "Animation", "reason": "Beautiful and emotional journey"}
]
```

---

### 1.3 RAG (Retrieval Augmented Generation)

Query your own documents/data to provide context for AI responses.

```java
@Configuration
public class RagConfig {

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return new PgVectorStore(jdbcTemplate, embeddingModel);
    }
}

@Service
public class DocumentQAService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public String askAboutDocuments(String question) {
        // Search for relevant documents
        List<Document> relevantDocs = vectorStore.similaritySearch(
            SearchRequest.builder()
                .query(question)
                .topK(5)
                .build()
        );

        // Use documents as context
        String context = relevantDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n"));

        return chatClient.prompt()
                .system("Answer based on this context: " + context)
                .user(question)
                .call()
                .content();
    }
}
```

---

### 1.4 Function/Tool Calling

Let the AI model call your Java methods when needed.

```java
@Service
public class WeatherService {

    private final ChatClient chatClient;

    public WeatherService(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultTools(new WeatherTools())
                .build();
    }

    public String getWeatherInfo(String query) {
        return chatClient.prompt()
                .user(query)
                .call()
                .content();
    }
}

// Define tools the AI can call
class WeatherTools {

    @Tool(description = "Get current weather for a city")
    public WeatherInfo getCurrentWeather(
            @ToolParam(description = "City name") String city) {
        // Call actual weather API
        return weatherApi.getWeather(city);
    }

    @Tool(description = "Get weather forecast for next N days")
    public List<WeatherInfo> getForecast(
            @ToolParam(description = "City name") String city,
            @ToolParam(description = "Number of days") int days) {
        return weatherApi.getForecast(city, days);
    }
}
```

**User Query:** "What's the weather like in Tokyo and should I bring an umbrella tomorrow?"

**AI Flow:**
1. AI recognizes it needs weather data
2. Calls `getCurrentWeather("Tokyo")`
3. Calls `getForecast("Tokyo", 1)`
4. Uses results to generate natural response

---

### 1.5 Streaming Responses

Get real-time streaming responses for better UX.

```java
@GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamChat(@RequestParam String message) {
    return chatClient.prompt()
            .user(message)
            .stream()
            .content();
}
```

---

### 1.6 Conversation Memory

Maintain context across multiple interactions.

```java
@Service
public class ConversationService {

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;

    public ConversationService(ChatClient.Builder builder, ChatMemory chatMemory) {
        this.chatMemory = chatMemory;
        this.chatClient = builder
                .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
                .build();
    }

    public String chat(String sessionId, String message) {
        return chatClient.prompt()
                .user(message)
                .advisors(a -> a.param("chat_memory_conversation_id", sessionId))
                .call()
                .content();
    }
}
```

---

### 1.7 Image Generation

Generate images from text prompts.

```java
@Service
public class ImageService {

    private final ImageModel imageModel;

    public String generateImage(String prompt) {
        ImageResponse response = imageModel.call(
            new ImagePrompt(prompt,
                ImageOptionsBuilder.builder()
                    .withModel("dall-e-3")
                    .withHeight(1024)
                    .withWidth(1024)
                    .build())
        );

        return response.getResult().getOutput().getUrl();
    }
}
```

---

### 1.8 Audio Transcription (Speech-to-Text)

```java
@Service
public class TranscriptionService {

    private final TranscriptionModel transcriptionModel;

    public String transcribe(Resource audioFile) {
        TranscriptionResponse response = transcriptionModel.call(
            new TranscriptionRequest(audioFile)
        );
        return response.getResult().getOutput();
    }
}
```

---

### 1.9 Text-to-Speech

```java
@Service
public class SpeechService {

    private final TextToSpeechModel ttsModel;

    public byte[] generateSpeech(String text) {
        SpeechResponse response = ttsModel.call(
            new SpeechRequest(text,
                SpeechOptionsBuilder.builder()
                    .withVoice("alloy")
                    .withSpeed(1.0f)
                    .build())
        );
        return response.getResult().getOutput();
    }
}
```

---

### 1.10 Model Context Protocol (MCP) - New in 1.1

Integrate with MCP servers for extended capabilities.

```java
@McpTool
public class DatabaseTools {

    @McpTool(description = "Execute SQL query")
    public QueryResult executeQuery(String sql) {
        return jdbcTemplate.queryForList(sql);
    }
}

@McpResource
public String getDatabaseSchema() {
    return schemaService.getSchema();
}

@McpPrompt
public String generateSqlQuery(String userIntent) {
    return "Generate SQL for: " + userIntent;
}
```

---

## 2. Supported AI Providers

| Provider | Chat | Embedding | Image | Audio |
|----------|------|-----------|-------|-------|
| OpenAI | Yes | Yes | Yes | Yes |
| Anthropic Claude | Yes | Yes | No | No |
| Azure OpenAI | Yes | Yes | Yes | Yes |
| Google Vertex AI | Yes | Yes | Yes | No |
| Amazon Bedrock | Yes | Yes | Yes | No |
| Ollama (Local) | Yes | Yes | No | No |
| Mistral AI | Yes | Yes | No | No |
| DeepSeek | Yes | Yes | No | No |

---

## 3. Multi-Provider Setup Example

```java
@Configuration
public class MultiModelConfig {

    @Bean
    @Primary
    public ChatClient openAiClient(OpenAiChatModel model) {
        return ChatClient.builder(model).build();
    }

    @Bean
    @Qualifier("anthropic")
    public ChatClient anthropicClient(AnthropicChatModel model) {
        return ChatClient.builder(model).build();
    }

    @Bean
    @Qualifier("ollama")
    public ChatClient ollamaClient(OllamaChatModel model) {
        return ChatClient.builder(model).build();
    }
}

@Service
public class SmartRouter {

    private final ChatClient openAi;
    private final ChatClient anthropic;
    private final ChatClient ollama;

    public String route(String query, String preferredModel) {
        ChatClient client = switch(preferredModel) {
            case "claude" -> anthropic;
            case "local" -> ollama;
            default -> openAi;
        };
        return client.prompt().user(query).call().content();
    }
}
```

---

## 4. Complete Application Example

```java
@SpringBootApplication
public class SpringAiDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringAiDemoApplication.class, args);
    }
}

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ChatClient chatClient;

    public AiController(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("You are a helpful assistant")
            .build();
    }

    // Simple chat
    @PostMapping("/chat")
    public String chat(@RequestBody String message) {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }

    // Structured output
    @PostMapping("/analyze")
    public SentimentAnalysis analyzeSentiment(@RequestBody String text) {
        return chatClient.prompt()
            .user("Analyze the sentiment: " + text)
            .call()
            .entity(SentimentAnalysis.class);
    }

    // Streaming
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> stream(@RequestParam String message) {
        return chatClient.prompt()
            .user(message)
            .stream()
            .content();
    }
}

record SentimentAnalysis(
    String sentiment,  // positive, negative, neutral
    double confidence,
    List<String> keywords
) {}
```

**pom.xml dependencies:**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-model-openai</artifactId>
    </dependency>
</dependencies>

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
```

---

## 5. Use Cases Summary

| Use Case | Spring AI Features Used |
|----------|------------------------|
| Chatbot | ChatClient, Memory |
| Q&A over documents | RAG, VectorStore, Embedding |
| Code assistant | Function Calling, Structured Output |
| Content generation | ChatClient, Streaming |
| Data extraction | Structured Output |
| Voice assistant | Transcription, TTS, Chat |
| Image generation | ImageModel |
| Autonomous agents | MCP, Advisors, Tool Calling |

---

## Sources

1. Spring AI Official Documentation: https://docs.spring.io/spring-ai/reference/
2. Spring AI 1.1 GA Release Notes: https://spring.io/blog/2025/11/12/spring-ai-1-1-GA-released
3. Spring AI 1.1.1 Release: https://spring.io/blog/2025/12/05/spring-ai-1-1-1-available-now
4. InfoWorld Tutorial: https://www.infoworld.com/article/4091447/spring-ai-tutorial-get-started-with-spring-ai.html
5. Java Code Geeks Guide: https://www.javacodegeeks.com/2025/11/spring-ai-integration-building-intelligent-java-applications.html

---

*Report generated: 2025-12-09*
