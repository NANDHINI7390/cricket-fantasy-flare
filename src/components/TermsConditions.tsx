import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Users, Gavel, DollarSign, AlertTriangle, Phone } from "lucide-react";

const TermsConditions = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-r from-indigo-50 to-purple-50"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-600">Please read our terms carefully before using our platform</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: January 2024</p>
        </div>

        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="terms">Terms of Use</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="fair-play">Fair Play</TabsTrigger>
            <TabsTrigger value="refund">Refund Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gavel className="w-5 h-5 mr-2 text-blue-600" />
                  Terms of Use
                </CardTitle>
                <CardDescription>
                  By using Fantasy Cricket Elite, you agree to the following terms and conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded border p-4">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                      <p className="text-gray-700 leading-relaxed">
                        By accessing and using Fantasy Cricket Elite ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. Eligibility</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• You must be at least 18 years of age to use our platform</li>
                        <li>• You must be a legal resident of India</li>
                        <li>• You are not residing in states where fantasy sports are prohibited</li>
                        <li>• You have the legal capacity to enter into binding agreements</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. Account Registration</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• You must provide accurate and complete information during registration</li>
                        <li>• You are responsible for maintaining the confidentiality of your account</li>
                        <li>• You must notify us immediately of any unauthorized use of your account</li>
                        <li>• One account per person is allowed</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. Game Rules and Fair Play</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• All games are based on skill and statistical analysis</li>
                        <li>• Multiple accounts, collusion, or any form of cheating is strictly prohibited</li>
                        <li>• Use of automated tools or bots is not allowed</li>
                        <li>• We reserve the right to investigate suspicious activities</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. Deposits and Withdrawals</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• All deposits are non-refundable except as required by law</li>
                        <li>• Withdrawals may take 1-3 business days to process</li>
                        <li>• We may require identity verification for large transactions</li>
                        <li>• Tax obligations are the responsibility of the user</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">6. Prohibited Activities</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Creating multiple accounts</li>
                        <li>• Sharing account information with third parties</li>
                        <li>• Using the platform for money laundering or fraud</li>
                        <li>• Attempting to manipulate contest outcomes</li>
                        <li>• Harassment or abuse of other users</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">7. Limitation of Liability</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Fantasy Cricket Elite shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform. Our liability is limited to the amount you have paid to us in the 12 months preceding the claim.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">8. Modifications to Terms</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of the platform after changes constitutes acceptance of the new terms.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Privacy Policy
                </CardTitle>
                <CardDescription>
                  How we collect, use, and protect your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded border p-4">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Personal information (name, email, phone number)</li>
                        <li>• Financial information for transactions</li>
                        <li>• Game statistics and preferences</li>
                        <li>• Device and usage information</li>
                        <li>• Communication records with our support team</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• To provide and improve our services</li>
                        <li>• To process transactions and payments</li>
                        <li>• To communicate with you about your account</li>
                        <li>• To detect and prevent fraud</li>
                        <li>• To comply with legal requirements</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Information Sharing</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We do not sell, trade, or rent your personal information to third parties. We may share information with trusted partners who assist us in operating our platform, conducting business, or serving you, as long as they agree to keep this information confidential.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Data Security</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• We use 256-bit SSL encryption for all data transmission</li>
                        <li>• Your financial information is never stored on our servers</li>
                        <li>• Regular security audits and updates</li>
                        <li>• Two-factor authentication for enhanced security</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Access to your personal information</li>
                        <li>• Correction of inaccurate data</li>
                        <li>• Deletion of your account and data</li>
                        <li>• Data portability</li>
                        <li>• Opt-out of marketing communications</li>
                      </ul>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fair-play" className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Fair Play Policy
                </CardTitle>
                <CardDescription>
                  Our commitment to maintaining a fair and enjoyable gaming environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded border p-4">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Skill-Based Gaming</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Fantasy Cricket Elite is a game of skill that requires knowledge of cricket, statistical analysis, and strategic thinking. We ensure all contests are fair and based purely on the skill and knowledge of participants.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Anti-Fraud Measures</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Advanced algorithms to detect suspicious patterns</li>
                        <li>• Manual review of high-stakes contests</li>
                        <li>• IP address and device tracking</li>
                        <li>• Identity verification for new accounts</li>
                        <li>• Real-time monitoring of all activities</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Prohibited Practices</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Creating multiple accounts</li>
                        <li>• Collusion between players</li>
                        <li>• Use of automated tools or scripts</li>
                        <li>• Sharing of insider information</li>
                        <li>• Any form of match-fixing or corruption</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Reporting Violations</h3>
                      <p className="text-gray-700 leading-relaxed">
                        If you suspect any unfair play or violation of our policies, please report it immediately to our support team. We take all reports seriously and investigate thoroughly.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Penalties</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• First offense: Warning and temporary suspension</li>
                        <li>• Repeat offenses: Permanent account termination</li>
                        <li>• Fraudulent activities: Legal action and law enforcement involvement</li>
                        <li>• All winnings from fraudulent activities will be forfeited</li>
                      </ul>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="refund" className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                  Refund Policy
                </CardTitle>
                <CardDescription>
                  Our policy regarding refunds and cancellations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded border p-4">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">General Refund Policy</h3>
                      <p className="text-gray-700 leading-relaxed">
                        All deposits made to Fantasy Cricket Elite are non-refundable. Once you join a contest, the entry fee cannot be refunded unless specifically mentioned in our exceptional circumstances policy.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Exceptional Circumstances</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Refunds may be considered in the following exceptional circumstances:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Match cancellation due to weather or other uncontrollable factors</li>
                        <li>• Technical errors on our platform that prevent fair participation</li>
                        <li>• Proven system malfunction affecting contest outcomes</li>
                        <li>• Violation of fair play detected in a contest</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Refund Process</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Refunds are processed back to the original payment method</li>
                        <li>• Processing time: 5-7 business days</li>
                        <li>• Users will be notified via email when refund is initiated</li>
                        <li>• Partial refunds may apply based on contest participation</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Contest Cancellations</h3>
                      <p className="text-gray-700 leading-relaxed">
                        If a contest is cancelled before the match begins, all entry fees will be refunded to participants' wallets. If a match is abandoned after it starts, prizes may be awarded based on the points scored up to that point.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Dispute Resolution</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• All refund requests must be submitted within 7 days</li>
                        <li>• Our support team will review each case individually</li>
                        <li>• Decisions are final and binding</li>
                        <li>• Users can escalate to our grievance officer if unsatisfied</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Contact for Refunds</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 mb-2">
                          <strong>Email:</strong> support@fantasycricketelite.com
                        </p>
                        <p className="text-gray-700 mb-2">
                          <strong>Phone:</strong> +91-9876543210
                        </p>
                        <p className="text-gray-700">
                          <strong>Response Time:</strong> 24-48 hours
                        </p>
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-yellow-800">Important Notice</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              These terms and conditions are subject to change. Users will be notified of any significant changes via email and platform notifications. Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
            <div className="flex items-center text-sm text-yellow-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>For any questions or concerns, contact our support team at support@fantasycricketelite.com</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default TermsConditions;