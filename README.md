# 📊 DataAgent: AI-Powered Data Analysis and Visualization

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**DataAgent** is an interactive web application built with the Gemini 2.5 Flash model that allows users to upload a CSV file and instantly generate charts and data summaries by simply typing natural language queries.

View your app in AI Studio: https://ai.studio/apps/temp/2

---

## 🚀 Getting Started

This guide provides instructions to set up and run the DataAgent application locally on your machine.

### Prerequisites

You need the following software installed:

* **Node.js** (LTS version recommended)
* **npm** (Node Package Manager)
* A **Gemini API Key** (obtainable from Google AI Studio)

### 1. Run Locally

1.  **Clone the repository:** (Assuming you have successfully pushed your code to GitHub).
    ```bash
    git clone [YOUR-REPOSITORY-URL]
    cd gemini-data-analyst # or the name of your cloned folder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your API Key:**
    * Create a file named **`.env.local`** in the root directory of the project.
    * Set your Gemini API Key inside this file:
        ```
        GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
        ```
    * **⚠️ IMPORTANT:** Do not commit this file to GitHub!

4.  **Run the app:**
    ```bash
    npm run dev
    ```
    The application should start, typically running on `http://localhost:3000`.

---

## 📸 Usage Guide

Follow these steps to upload a file and start analyzing your data using natural language commands.

### 1. Upload Your Data
* Click the **"Upload CSV"** box or drag and drop your data file onto the area. * The application will load the data and switch to the **Data Preview** mode.

### 2. Preview Your Data Structure
Once uploaded, the screen will display the first 100 rows of your dataset, allowing you to quickly verify the data quality and identify the available column names.

* The **COLUMNS** sidebar on the left shows all fields available for analysis (e.g., `Year`, `Industry_name_NZSIOC`, `Value`).
* Verify the data loads correctly (e.g., the `annual-enterprise-survey` is loaded with 19892 rows). 
### 3. Generate Visualizations

Use the chat interface to ask the AI to analyze and plot your data.

* In the text box, enter a command specifying the type of chart and the columns you want to use.
* **Example Query:** `give a barchart for year and value` * The **DataAgent** (powered by Gemini 2.5 Flash) will process the request, generate the necessary visualization code, and display the resulting chart directly in the interface.

**Example Visualization Output:** The application displays a **Bar Chart** showing the aggregate **'Value by Year'**, with specific data points highlighted on hover (e.g., Year 2018, Value: 345).


---

## 📸 Screenshots

### Full Application View
![Entire App](./Entire%20App.png)

> Complete interface including data preview, sidebar columns, AI chat and chart output.

---



### Upload Screen (Initial State)
![Data Preview](./Screenshot%202025-12-03%20at%2010.23.28.png)


> CSV upload interface before data is loaded.
---

### Data Preview Mode
![Visualization](./Screenshot%202025-12-03%20at%2010.23.37.png)

 Dataset loaded successfully with column overview and first 100 rows shown.

---
### Chart Generation Output
![Upload Screen](./Screenshot%202025-12-03%20at%2010.23.08.png)

> AI-generated visualization using natural language query.>

---
