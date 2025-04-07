
import React from "react";
import { PaymentMethod } from "@/types/transaction";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Wallet, LandPlot, QrCode } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  details: Record<string, any>;
  onDetailsChange: (details: Record<string, any>) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  details,
  onDetailsChange
}) => {
  const handleDetailsChange = (key: string, value: string) => {
    onDetailsChange({ ...details, [key]: value });
  };

  return (
    <div className="space-y-4">
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={(value) => onMethodChange(value as PaymentMethod)}
        className="grid grid-cols-2 gap-3"
      >
        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:border-purple-400 transition-colors">
          <RadioGroupItem value="upi" id="upi" />
          <Label htmlFor="upi" className="flex items-center cursor-pointer">
            <QrCode className="h-5 w-5 mr-2 text-green-600" />
            <span>UPI</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:border-purple-400 transition-colors">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card" className="flex items-center cursor-pointer">
            <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
            <span>Card</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:border-purple-400 transition-colors">
          <RadioGroupItem value="netbanking" id="netbanking" />
          <Label htmlFor="netbanking" className="flex items-center cursor-pointer">
            <LandPlot className="h-5 w-5 mr-2 text-purple-600" />
            <span>Net Banking</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:border-purple-400 transition-colors">
          <RadioGroupItem value="wallet" id="wallet" />
          <Label htmlFor="wallet" className="flex items-center cursor-pointer">
            <Wallet className="h-5 w-5 mr-2 text-orange-600" />
            <span>Wallet</span>
          </Label>
        </div>
      </RadioGroup>

      {/* Payment method-specific fields */}
      <div className="mt-4">
        {selectedMethod === 'upi' && (
          <div className="space-y-2">
            <Label htmlFor="upi-id">UPI ID</Label>
            <Input 
              id="upi-id" 
              placeholder="yourname@upi" 
              value={details.upiId || ''} 
              onChange={(e) => handleDetailsChange('upiId', e.target.value)} 
            />
          </div>
        )}

        {selectedMethod === 'card' && (
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input 
              id="card-number" 
              placeholder="1234 5678 9012 3456" 
              value={details.cardNumber || ''} 
              onChange={(e) => handleDetailsChange('cardNumber', e.target.value)}
              maxLength={19}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY" 
                  value={details.expiry || ''} 
                  onChange={(e) => handleDetailsChange('expiry', e.target.value)}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input 
                  id="cvv" 
                  placeholder="123" 
                  type="password" 
                  value={details.cvv || ''} 
                  onChange={(e) => handleDetailsChange('cvv', e.target.value)}
                  maxLength={3}
                />
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'netbanking' && (
          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank</Label>
            <select 
              id="bank" 
              className="w-full p-2 border rounded"
              value={details.bank || ''}
              onChange={(e) => handleDetailsChange('bank', e.target.value)}
            >
              <option value="">Select a bank</option>
              <option value="sbi">State Bank of India</option>
              <option value="hdfc">HDFC Bank</option>
              <option value="icici">ICICI Bank</option>
              <option value="axis">Axis Bank</option>
              <option value="kotak">Kotak Mahindra Bank</option>
            </select>
          </div>
        )}

        {selectedMethod === 'wallet' && (
          <div className="space-y-2">
            <Label htmlFor="wallet-type">Select Wallet</Label>
            <select 
              id="wallet-type" 
              className="w-full p-2 border rounded"
              value={details.walletType || ''}
              onChange={(e) => handleDetailsChange('walletType', e.target.value)}
            >
              <option value="">Select a wallet</option>
              <option value="paytm">Paytm</option>
              <option value="phonepe">PhonePe</option>
              <option value="amazonpay">Amazon Pay</option>
              <option value="mobikwik">MobiKwik</option>
              <option value="freecharge">Freecharge</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
