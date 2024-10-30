import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      headless: true,  // Changed from 'new' to true
    });
    const page = await browser.newPage();

    await page.goto('https://www.flashscore.com/', {
      waitUntil: 'networkidle0',
    });

    await page.waitForSelector('.leagues--live');

    const matches = await page.evaluate(() => {
      const matchElements = document.querySelectorAll('.event__match');
      return Array.from(matchElements).map(match => {
        const homeTeam = match.querySelector('.event__homeParticipant')?.textContent;
        const awayTeam = match.querySelector('.event__awayParticipant')?.textContent;
        const homeScore = match.querySelector('.event__score--home')?.textContent;
        const awayScore = match.querySelector('.event__score--away')?.textContent;
        const status = match.querySelector('.event__stage--block')?.textContent;

        return {
          homeTeam,
          awayTeam,
          homeScore,
          awayScore,
          status,
        };
      });
    });

    await browser.close();

    return NextResponse.json({ matches });

  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live scores' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';