import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F97316] w-full justify-between items-center h-[82px] min-h-[82px] max-h-[82px] shadow-xl flex p-4 box-border">
        <div className="w-[165px] h-[40px] flex justify-between items-center">
          <div className="bg-[#a159d6] w-[40px] h-[40px] flex justify-center items-center rounded-[12px] shadow-lg">
            <img
              src="images/肉球.svg"
              alt="肉球"
              className="w-[28px] h-[28px] object-contain"
            />
          </div>
          <div className="w-[120px] h-[30px] text-white text-[22px] font-semibold flex items-center">
            ペット日記
          </div>
        </div>
        <div className="w-[281px] h-[50px] flex justify-between items-center">
          <div className="w-[50px] h-[19px] text-white text-[16px] leading-[20px] font-sans">
            ホーム
          </div>
          <div className="bg-[#e27c63] w-[172px] h-[50px] rounded-[12px] px-[22px] flex justify-between items-center">
            <div className="bg-[#de937c] w-[32px] h-[32px] rounded-[50%] flex justify-center items-center">
              <img
                src="images/本.svg"
                alt="本"
                className="w-[21px] h-[21px] object-contain"
              />
            </div>
            <div className="w-[64px] h-[19px] text-white text-[16px] leading-[20px] font-sans">
              日記一覧
            </div>
            <div className="bg-[#ff9ca9] w-[14px] h-[14px] flex justify-center items-center">
              <img
                src="images/星.svg"
                alt="星"
                className="w-[14px] h-[14px] object-contain"
              />
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col px-[240px] py-[40px]">
        <div className="w-full h-[24px] flex items-center">
          <div className="w-[18px] h-[18px]">
            <img
              src="/images/左矢印.png"
              alt="左矢印"
              className="w-[18px] h-[18px] object-cover"
            />
          </div>
          <div className="w-auto h-[19px] text-[#9333EA] text-[14px] font-sans ml-[4px]">
            日記一覧に戻る
          </div>
        </div>
        <div className="w-full h-auto flex flex-col mt-[32px]">
          <div className="w-full h-[500px] flex">
            <img
              src="images/yuki.jpg"
              alt="ユキ"
              className="w-full h-[500px] rounded-t-[16px] object-cover"
            />
          </div>
          <div className="bg-[#e8e3e8] w-full h-auto flex flex-col rounded-b-[16px] shadow-2xl p-[32px]">
            <div className="w-full h-[46px] flex justify-between items-center">
              <div className="bg-[#F3E8FF] w-[170px] h-[40px] rounded-[9px] px-[16px] flex items-center">
                <div className=" w-full h-[26px] flex items-center">
                  <div className="w-[26px] h-[26px] rounded-[50%] flex justify-center items-center">
                    <img
                      src="/images/日付.png"
                      alt="日付"
                      className="w-[18px] h-[18px] object-cover"
                    />
                  </div>
                  <div className="w-[100px] h-[17px] text-[#6B7280] leading-[18px] text-[14px] font-sans flex ml-[6px]">
                    2023年12月1日
                  </div>
                </div>
              </div>
              <div className=" w-[190px] h-[46px] flex justify-between items-center">
                <div className="bg-white w-[82px] h-[46px] border-[#9333EA] border-[1px] rounded-[12px] flex justify-center items-center">
                  <div className="w-auto h-[19px] text-[#9333EA] text-[14px] font-sans">
                    編集
                  </div>
                </div>
                <div className=" w-[96px] h-[46px] py-[13.5px] px-[20px] flex justify-between">
                  <div className="bg-[#e5bdff] w-[16px] h-[16px]">
                    <img
                      src="/images/ゴミ箱.png"
                      alt="ゴミ箱"
                      className="w-[16px] h-[16px] object-cover"
                    />
                  </div>
                  <div className="w-[32px] h-[19px] text-[13.6px] text-white font-sans leading-[18px]">
                    削除
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-auto flex text-[15.3px] text-[#1F2937] leading-[34px] mt-[24px]">
              初めての部屋んぽ中に疲れてしまい、堂々と居眠りをしているユキちゃん。まだ危ないことの区別がつかないので、隙間にハマったり自ら穴に落ちたりなど、日々飼い主に助けられながらも危険な挑戦を繰り返している。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
