
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, Eye, Users, FileText, AlertTriangle, CheckCircle, Server } from "lucide-react";

const SecurityPolicy = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30">
        {/* Hero Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                🔒 SmartHoster.io Security Policy
              </h1>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 mb-8">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Effective Date:</strong> 1 June 2025
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Company:</strong> SmartHoster.io, operated by BBAR Unipessoal LDA
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Contact:</strong> admin@smarthoster.io
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  At SmartHoster.io, the security of your property, data, and guest information is not an afterthought — it's foundational. We adhere to strict protocols to protect all data in transit and at rest, prevent unauthorized access, and ensure business continuity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Sections */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Data Encryption */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Lock className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">🔐 1. Data Encryption</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>SSL/TLS Encryption:</strong> All data transmitted between users and SmartHoster.io is encrypted using industry-standard TLS 1.3 protocols.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>At-Rest Encryption:</strong> Sensitive data (including user credentials, booking info, and legal documents) is encrypted at rest using AES-256 encryption.</span>
                  </li>
                </ul>
              </div>

              {/* Hosting Infrastructure */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Server className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">🧱 2. Hosting Infrastructure</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Our application is hosted on secure, GDPR-compliant cloud infrastructure located in the EU.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>We leverage platforms such as AWS and Google Cloud for best-in-class DDoS protection, redundancy, and failover capabilities.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Systems are containerized and sandboxed for isolation, using Docker and Kubernetes standards where applicable.</span>
                  </li>
                </ul>
              </div>

              {/* Access Control */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Eye className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">🔍 3. Access Control & Authentication</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Role-Based Access Control (RBAC):</strong> Only authorized personnel may access client or guest data based on their specific function.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Two-Factor Authentication (2FA):</strong> Enforced across all internal admin tools.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Session Expiry & Tokenization:</strong> Sessions are tokenized and automatically expire after periods of inactivity.</span>
                  </li>
                </ul>
              </div>

              {/* Vendor Security */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">🧑‍💻 4. Vendor & Third-Party Security</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>We use trusted third-party vendors (e.g., HostKit, Stripe, Nuki, Doinn) with robust encryption and compliance guarantees.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>All integrations are reviewed regularly for security compliance and are sandboxed where feasible.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>All external tools we integrate are vetted for GDPR, PCI DSS, and SOC 2 Type II compliance where applicable.</span>
                  </li>
                </ul>
              </div>

              {/* Data Collection */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">📋 5. Data Collection & Retention</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>We collect only the data necessary to operate our services, including booking records, legal compliance submissions, and communication logs.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Personal data is retained only as long as required for regulatory compliance or contractual obligations.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Clients may request deletion of their data at any time in accordance with our GDPR Policy.</span>
                  </li>
                </ul>
              </div>

              {/* Incident Response */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <AlertTriangle className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">📣 6. Incident Response</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>We maintain a written Incident Response Plan (IRP) reviewed quarterly.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>In the unlikely event of a breach, affected users will be notified within 72 hours in compliance with EU law.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Logs and audit trails are retained and analyzed to detect unauthorized access or anomalies.</span>
                  </li>
                </ul>
              </div>

              {/* Testing & Audits */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Shield className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">🧪 7. Penetration Testing & Audits</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Annual penetration testing is conducted by independent third parties.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>All critical infrastructure undergoes code audits and security reviews on a bi-annual basis.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>SmartHoster's software is built with secure-by-design principles, using modern security libraries and OWASP standards.</span>
                  </li>
                </ul>
              </div>

              {/* Regulatory Compliance */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">👨‍⚖️ 8. Regulatory Compliance</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>We are fully compliant with EU GDPR regulations.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>All tax and legal submissions (e.g., SEF, eFatura, Model 30) are handled through secure APIs or encrypted submissions.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Our legal and technical teams monitor changes in compliance requirements in Portugal, France, and other serviced regions.</span>
                  </li>
                </ul>
              </div>

              {/* Employee Training */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">🧠 9. Employee Training & NDA</h2>
                </div>
                <p className="text-gray-700 mb-4">All staff with access to sensitive systems are required to:</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Undergo security awareness training.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Sign confidentiality agreements and NDAs.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Use strong, randomly-generated passwords with enforced rotation policies.</span>
                  </li>
                </ul>
              </div>

              {/* Your Role */}
              <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-200">
                <div className="flex items-center mb-6">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">🤝 10. Your Role in Security</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Clients are encouraged to use strong passwords and avoid sharing credentials.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Property owners are responsible for physical access to on-site smart locks unless SmartHoster is designated manager.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Reports of suspicious activity should be emailed immediately to <strong>admin@smarthoster.io</strong>.</span>
                  </li>
                </ul>
              </div>

              {/* Changes to Policy */}
              <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🧾 Changes to This Policy</h2>
                <p className="text-gray-700">
                  We reserve the right to update this policy as needed to reflect changes in regulations, threats, or technologies. Material changes will be announced via email and/or platform notification.
                </p>
              </div>

            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SecurityPolicy;
