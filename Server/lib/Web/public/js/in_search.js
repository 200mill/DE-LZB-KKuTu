/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Rule the words! DE LZB KKuTu
 * You can see this file in <https://github.com/minjun1177/DE-LZB-KKuTu>
 */

const themeSelect = document.getElementById('theme-select');
const searchBtn = document.getElementById('search-btn');
const wordList = document.getElementById('word-list');
const initialMessage = document.getElementById('initial-message');

if (!themeSelect || !searchBtn || !wordList || !initialMessage) {
    console.error('검색기 DOM 요소를 찾지 못했습니다.');
} else {
    const performSearch = async () => {
        const theme = themeSelect.value;

        if (!theme) {
            initialMessage.style.display = 'none';
            wordList.innerHTML = '<li>주제를 선택해주세요.</li>';
            return;
        }

        initialMessage.style.display = 'none';
        wordList.innerHTML = '<li>불러오는 중...</li>';
                                                                  
        try {
            const response = await fetch(`/search/words?theme=${encodeURIComponent(theme)}`);
                                                                  
            if (!response.ok) {
                throw new Error(`단어 목록을 불러올 수 없습니다. (HTTP ${response.status})`);
            }
                                                                                 
            const payload = await response.json();
            const words = (payload.words || []).filter(word => (word || '').trim() !== '');
                                                            
            wordList.innerHTML = '';        
            if (words.length > 0) {
                words.forEach(word => {
                    const li = document.createElement('li');
                    li.textContent = word;
                    wordList.appendChild(li);
                });
            } else {
                wordList.innerHTML = '<li>파일에 단어가 없습니다.</li>';
            }
                     
        } catch (error) {
            console.error('단어 목록 로딩 오류:', error);
            wordList.innerHTML = `<li>오류가 발생했습니다: ${error.message}</li>`;
        }
    };

    searchBtn.addEventListener('click', performSearch);

    // Enter 키로도 검색 가능
    themeSelect.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}