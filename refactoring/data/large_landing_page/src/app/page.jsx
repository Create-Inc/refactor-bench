import { useId } from 'react';

export default function HomePage() {
  const nameId = useId();
  const emailId = useId();
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left side - Text content */}
            <div className="space-y-6">
              <h1 className="font-bold text-4xl text-gray-900 leading-tight md:text-5xl lg:text-6xl">
                Stay Focused.
                <br />
                Hit Your Goals.
              </h1>

              <p className="max-w-lg text-gray-600 text-lg leading-relaxed md:text-xl">
                Plan your day, stay accountable, and build lasting habits — all
                in one clean dashboard.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Get Started Free
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-8 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right side - App visual placeholder */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main app mockup container */}
                <div className="w-full max-w-md rounded-2xl bg-gray-100 p-8 shadow-2xl">
                  {/* Mock app header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <div className="h-4 w-4 rounded-sm bg-white" />
                      </div>
                      <span className="font-semibold text-gray-900">
                        FocusMate
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                  </div>

                  {/* Mock dashboard content */}
                  <div className="space-y-4">
                    {/* Today's focus section */}
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Today's Focus
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-4 w-4 rounded-full bg-green-500" />
                          <span className="text-gray-600 text-sm">
                            Morning workout
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          <span className="text-gray-600 text-sm">
                            Project review
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          <span className="text-gray-600 text-sm">
                            Team meeting
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Time blocks */}
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Time Blocks
                      </h3>
                      <div className="space-y-2">
                        <div className="rounded bg-blue-100 p-2">
                          <div className="font-medium text-blue-800 text-xs">
                            9:00 - 11:00 AM
                          </div>
                          <div className="text-blue-900 text-sm">Deep Work</div>
                        </div>
                        <div className="rounded bg-green-100 p-2">
                          <div className="font-medium text-green-800 text-xs">
                            2:00 - 3:30 PM
                          </div>
                          <div className="text-green-900 text-sm">Meetings</div>
                        </div>
                      </div>
                    </div>

                    {/* Streak counter */}
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 text-sm">
                          Current Streak
                        </span>
                        <span className="font-bold text-2xl text-orange-500">
                          7🔥
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements for visual interest */}
                <div className="-top-4 -right-4 absolute h-16 w-16 rounded-full bg-blue-200 opacity-60" />
                <div className="-bottom-6 -left-6 absolute h-12 w-12 rounded-full bg-green-200 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bold CTA Section */}
      <section className="bg-blue-600 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 font-bold text-2xl text-white md:text-3xl lg:text-4xl">
            Join thousands of people planning better days with FocusMate
          </h2>
          <button
            type="button"
            className="rounded-lg bg-white px-10 py-4 font-bold text-blue-600 text-lg shadow-lg transition-colors hover:bg-gray-50"
          >
            Try It Free
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Start free and upgrade as you grow. All plans include a 14-day
              free trial.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <div className="mb-6 text-center">
                <h3 className="mb-2 font-bold text-2xl text-gray-900">Free</h3>
                <div className="mb-1 font-bold text-4xl text-gray-900">$0</div>
                <div className="text-gray-600">Forever</div>
              </div>

              <ul className="mb-8 space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Up to 3 daily goals</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Basic time blocking</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">7-day habit streaks</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Mobile app access</span>
                </li>
              </ul>

              <button
                type="button"
                className="w-full rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                Start Free Trial
              </button>
            </div>

            {/* Pro Plan - Recommended */}
            <div className="relative transform rounded-2xl border-2 border-blue-500 bg-white p-8 shadow-xl md:scale-105">
              <div className="-top-4 -translate-x-1/2 absolute left-1/2 transform">
                <div className="rounded-full bg-blue-500 px-4 py-1 font-semibold text-sm text-white">
                  Most Popular
                </div>
              </div>

              <div className="mb-6 text-center">
                <h3 className="mb-2 font-bold text-2xl text-gray-900">Pro</h3>
                <div className="mb-1 font-bold text-4xl text-gray-900">$12</div>
                <div className="text-gray-600">per month</div>
              </div>

              <ul className="mb-8 space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Unlimited daily goals</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Advanced time blocking</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">
                    Unlimited habit tracking
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">
                    Weekly & monthly reports
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Calendar integrations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>

              <button
                type="button"
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Start Free Trial
              </button>
            </div>

            {/* Business Plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <div className="mb-6 text-center">
                <h3 className="mb-2 font-bold text-2xl text-gray-900">
                  Business
                </h3>
                <div className="mb-1 font-bold text-4xl text-gray-900">$30</div>
                <div className="text-gray-600">per month</div>
              </div>

              <ul className="mb-8 space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Shared accountability</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Admin dashboard</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <span className="text-gray-700">Dedicated support</span>
                </li>
              </ul>

              <button
                type="button"
                className="w-full rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up Form Section */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
            Start planning your day in under a minute.
          </h2>
          <p className="mb-8 text-gray-600 text-lg">
            Get started with FocusMate today and take control of your
            productivity.
          </p>

          <div className="mx-auto max-w-md rounded-2xl bg-gray-50 p-8">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor={nameId}
                  className="mb-2 block text-left font-medium text-gray-700 text-sm"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id={nameId}
                  name="name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor={emailId}
                  className="mb-2 block text-left font-medium text-gray-700 text-sm"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id={emailId}
                  name="email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email address"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Get Started Free
              </button>
            </form>

            <p className="mt-4 text-gray-500 text-xs">
              No credit card required. Start your 14-day free trial today.
            </p>
          </div>
        </div>
      </section>

      {/* Free Checklist Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                <div className="h-4 w-4 rounded-sm bg-white" />
              </div>
            </div>
            <h2 className="mb-3 font-bold text-2xl text-gray-900 md:text-3xl">
              Get our free productivity checklist
            </h2>
            <p className="text-gray-600">
              A simple guide to help you build better daily habits and stay
              focused on what matters most.
            </p>
          </div>

          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                className="whitespace-nowrap rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
              >
                Get Checklist
              </button>
            </div>
            <p className="mt-3 text-gray-500 text-xs">
              Free download. No spam, ever.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
              How FocusMate Works
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Get organized and stay focused in three simple steps
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 font-bold text-2xl text-white">
                1
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                Make a Plan
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Set your daily goals and priorities to know exactly what you
                want to accomplish.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 font-bold text-2xl text-white">
                2
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                Time-Block Your Tasks
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Schedule focused work sessions and break your day into
                manageable chunks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 font-bold text-2xl text-white">
                3
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                Track Your Progress
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Build streaks, celebrate wins, and stay motivated with visual
                progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
              Everything You Need to Stay Productive
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Simple tools that work together to help you build better habits
              and achieve your goals
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 - Daily Planning */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <div className="h-6 w-6 rounded-sm bg-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                Daily Planning
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Set up to 10 daily goals and organize them by priority to stay
                focused on what matters most.
              </p>
            </div>

            {/* Feature 2 - Time Blocking */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <div className="h-6 w-6 rounded border-2 border-green-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                Time Blocking
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Schedule focused work sessions and break your day into
                manageable, productive chunks.
              </p>
            </div>

            {/* Feature 3 - Streak Tracker */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <span className="font-bold text-orange-600 text-xl">🔥</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                Streak Tracker
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Build momentum with visual streak counters that motivate you to
                maintain your habits.
              </p>
            </div>

            {/* Feature 4 - Daily Reminders */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <div className="relative h-6 w-6 rounded-full border-2 border-purple-600">
                  <div className="absolute top-1 left-1 h-2 w-2 rounded-full bg-purple-600" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                Daily Reminders
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get gentle nudges throughout the day to keep you on track with
                your goals and habits.
              </p>
            </div>

            {/* Feature 5 - Progress Reports */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <div className="space-y-1">
                  <div className="h-1 w-6 rounded bg-indigo-600" />
                  <div className="h-1 w-4 rounded bg-indigo-400" />
                  <div className="h-1 w-5 rounded bg-indigo-300" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                Progress Reports
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                See weekly and monthly insights to understand your patterns and
                celebrate your wins.
              </p>
            </div>

            {/* Feature 6 - Social Accountability */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-teal-600" />
                  <div className="h-2 w-2 rounded-full bg-teal-400" />
                  <div className="h-2 w-2 rounded-full bg-teal-300" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                Social Accountability
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Share your progress with friends or join groups to stay
                motivated and accountable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
              Built for Every Type of Goal-Getter
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              See how different people use FocusMate to stay productive and
              achieve their goals
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Students */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                <div className="relative h-8 w-8 rounded-sm border-2 border-white">
                  <div className="absolute top-2 left-1 h-0.5 w-3 bg-white" />
                  <div className="absolute top-3 left-1 h-0.5 w-3 bg-white" />
                  <div className="absolute top-4 left-1 h-0.5 w-2 bg-white" />
                </div>
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                Students
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Balance coursework, assignments, and study sessions with
                time-blocking. Track study streaks and stay motivated during
                exam periods with clear daily goals.
              </p>
            </div>

            {/* Freelancers */}
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                <div className="relative h-8 w-8 rounded-lg border-2 border-white">
                  <div className="absolute top-1 left-1 h-2 w-2 rounded-full bg-white" />
                  <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white" />
                  <div className="absolute bottom-2 left-1 h-0.5 w-4 bg-white" />
                </div>
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                Freelancers
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Manage multiple client projects and deadlines with focused work
                blocks. Set daily revenue goals and track productive habits that
                grow your business.
              </p>
            </div>

            {/* Developers */}
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                <div className="relative h-8 w-8 rounded border-2 border-white">
                  <div className="absolute top-1 left-1 h-4 w-1 bg-white" />
                  <div className="absolute top-1 left-3 h-2 w-1 bg-white" />
                  <div className="absolute top-1 right-1 h-3 w-1 bg-white" />
                </div>
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                Developers
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Schedule deep coding sessions without interruptions. Track daily
                commits, learning goals, and side project progress while
                maintaining work-life balance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
