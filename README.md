# Tessera - Policy and Public Sentiment Analyst

Tessera is an AI-powered policy analysis and public sentiment tracking dashboard built for the Microsoft and CCI Hackathon. It empowers government analysts, policy makers, and civic organizations to quickly gauge public response to federal regulations.

## Key Features

- **Federal Register Integration**: Search and import policies directly from the open government Federal Register API.
- **AI Dossier Generation**: Automatically aggregates public comments and news reporting related to a specific policy.
- **Public Sentiment Analysis**: Leverages **Microsoft Foundry** (via Azure OpenAI) to analyze sentiment and classify feedback into key findings (e.g., support, opposition, misunderstanding, or emerging issues).
- **Executive Summaries**: Synthesizes thousands of pages of policy text and public comments into 3-5 sentence plain-language summaries.
- **Beautiful UI**: Modern glassmorphism design with a dark mode tailored for presentations and high readability.

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Radix UI.
- **AI / Cloud Services**:
  - **Microsoft Foundry**: Used to orchestrate LLM calls and configure model deployments.
  - **Azure AI / Azure OpenAI**: Deployed `gpt-oss-120b` for heavy textual analysis and sentiment parsing.
- **Government Open Data**:
  - Federal Register API (`https://www.federalregister.gov/api/v1/`)
  - Regulations.gov API (for docket and comment tracking)

## Setup & Running Locally

1. Clone this repository.
2. Ensure you have Node.js and NPM installed.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`.

## Architecture & Security

Tessera is designed to keep backend logic and sensitive API keys secure. All AI analysis and API fetching happens server-side. The frontend only communicates with secure backend endpoints, ensuring that Azure API keys and logic are never exposed to the client.

## Hackathon Team

Built for the Microsoft and CCI Hackathon.