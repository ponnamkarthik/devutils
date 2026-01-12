import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { JsonTool } from './pages/JsonTool';
import { JsonTreeTool } from './pages/JsonTreeTool';
import { JsonConverterTool } from './pages/JsonConverterTool';
import { YamlJsonTool } from './pages/YamlJsonTool';
import { UuidTool } from './pages/UuidTool';
import { Base64Tool } from './pages/Base64Tool';
import { SqlTool } from './pages/SqlTool';
import { CodeMinifierTool } from './pages/CodeMinifierTool';
import { CodeFormatterTool } from './pages/CodeFormatterTool';
import { CsvJsonTool } from './pages/CsvJsonTool';
import { CronTool } from './pages/CronTool';
import { RegexTool } from './pages/RegexTool';
import { HashTool } from './pages/HashTool';
import { DiffViewerTool } from './pages/DiffViewerTool';
import { QrCodeTool } from './pages/QrCodeTool';
import { FakeDataTool } from './pages/FakeDataTool';
import { UrlTool } from './pages/UrlTool';
import { ColorTool } from './pages/ColorTool';
import { WorldClockTool } from './pages/WorldClockTool';
import { StringInspectorTool } from './pages/StringInspectorTool';
import { UnixTimeTool } from './pages/UnixTimeTool';
import { JwtDebuggerTool } from './pages/JwtDebuggerTool';
import { HttpRequestBuilderTool } from './pages/HttpRequestBuilderTool';
import { PasswordTool } from './pages/PasswordTool';
import { MarkdownTool } from './pages/MarkdownTool';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* JSON Tools SEO Routes */}
          <Route path="/json" element={<Navigate to="/json/format" replace />} />
          <Route path="/json/format" element={<JsonTool mode="format" />} />
          <Route path="/json/minify" element={<JsonTool mode="minify" />} />
          <Route path="/json/fix" element={<JsonTool mode="fix" />} />
          <Route path="/json/graph" element={<JsonTreeTool />} />
          <Route path="/json/converter" element={<JsonConverterTool />} />
          
          {/* YAML Tools */}
          <Route path="/yaml" element={<Navigate to="/yaml/json" replace />} />
          <Route path="/yaml/json" element={<YamlJsonTool mode="yaml2json" />} />
          <Route path="/yaml/yaml" element={<YamlJsonTool mode="json2yaml" />} />

          <Route path="/uuid" element={<UuidTool />} />
          
          {/* Base64 Tool SEO Routes */}
          <Route path="/base64" element={<Navigate to="/base64/encode" replace />} />
          <Route path="/base64/encode" element={<Base64Tool mode="encode" />} />
          <Route path="/base64/decode" element={<Base64Tool mode="decode" />} />
          
          {/* CSV Tools */}
          <Route path="/csv" element={<Navigate to="/csv/json" replace />} />
          <Route path="/csv/json" element={<CsvJsonTool mode="json" />} />
          <Route path="/csv/csv" element={<CsvJsonTool mode="csv" />} />

          <Route path="/sql" element={<SqlTool />} />
          <Route path="/cron" element={<CronTool />} />
          <Route path="/regex" element={<RegexTool />} />
          <Route path="/hash" element={<HashTool />} />
          
          <Route path="/code/minify" element={<CodeMinifierTool />} />
          <Route path="/code/format" element={<CodeFormatterTool />} />
          
          <Route path="/diff" element={<DiffViewerTool />} />
          <Route path="/qrcode" element={<QrCodeTool />} />
          <Route path="/fake-data" element={<FakeDataTool />} />
          <Route path="/string-inspector" element={<StringInspectorTool />} />
          <Route path="/unix" element={<UnixTimeTool />} />
          <Route path="/jwt" element={<JwtDebuggerTool />} />
          
          <Route path="/http/builder" element={<HttpRequestBuilderTool />} />
          <Route path="/password" element={<PasswordTool />} />
          
          <Route path="/markdown" element={<MarkdownTool />} />
          
          {/* URL Tools SEO Routes */}
          <Route path="/url" element={<Navigate to="/url/parser" replace />} />
          <Route path="/url/parser" element={<UrlTool mode="parser" />} />
          <Route path="/url/encode" element={<UrlTool mode="encoder" />} />
          <Route path="/url/decode" element={<UrlTool mode="decoder" />} />

          <Route path="/color" element={<ColorTool />} />
          <Route path="/world-clock" element={<WorldClockTool />} />
          
          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;