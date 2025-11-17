import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function TestDesignSystem() {
  const [count, setCount] = useState(0);
  const [switchState, setSwitchState] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Component Test</CardTitle>
          <CardDescription>
            Testing React components as Astro islands with Figmapaa design system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counter Test */}
          <div>
            <h3 className="font-semibold mb-3">Counter Test</h3>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setCount(count - 1)}
                variant="outline"
              >
                Decrease
              </Button>
              <span className="font-mono text-xl px-4">{count}</span>
              <Button
                onClick={() => setCount(count + 1)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Increase
              </Button>
            </div>
          </div>

          {/* Input Test */}
          <div>
            <Label htmlFor="test-input">Test Input</Label>
            <Input
              id="test-input"
              type="text"
              placeholder="Type something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="max-w-sm"
            />
            {inputValue && (
              <p className="mt-2 text-sm text-gray-600">
                You typed: <Badge variant="secondary">{inputValue}</Badge>
              </p>
            )}
          </div>

          {/* Switch Test */}
          <div className="flex items-center space-x-2">
            <Switch
              id="test-switch"
              checked={switchState}
              onCheckedChange={setSwitchState}
            />
            <Label htmlFor="test-switch">
              Switch is {switchState ? 'ON' : 'OFF'}
            </Label>
          </div>

          {/* Select Test */}
          <div>
            <Label htmlFor="test-select">Select Option</Label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
            {selectValue && (
              <p className="mt-2 text-sm">
                Selected: <Badge className={`bg-${selectValue}-500 text-white`}>{selectValue}</Badge>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Test */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs Component</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <Alert>
                <AlertTitle>Tab 1 Content</AlertTitle>
                <AlertDescription>
                  This is the content for the first tab.
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="tab2">
              <Alert className="border-purple-200 bg-purple-50">
                <AlertTitle className="text-purple-800">Tab 2 Content</AlertTitle>
                <AlertDescription className="text-purple-700">
                  Purple themed content for the second tab.
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="tab3">
              <Alert className="border-green-200 bg-green-50">
                <AlertTitle className="text-green-800">Tab 3 Content</AlertTitle>
                <AlertDescription className="text-green-700">
                  Success themed content for the third tab.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Status Alert */}
      <Alert className="border-green-200 bg-green-50">
        <AlertTitle className="text-green-800">Design System Active</AlertTitle>
        <AlertDescription className="text-green-700">
          All components are working correctly with the Figmapaa design system!
          Using OKLCH colors and Tailwind v4.
        </AlertDescription>
      </Alert>
    </div>
  );
}