import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F97316] w-full justify-between items-center h-[82px] min-h-[82px] max-h-[82px] flex p-4 box-border">
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
      <div className="flex-1 flex px-[16px]">
        <div className="w-full flex flex-col">
          <div className="w-full h-[48px] mt-[40px] flex justify-between items-center">
            <div className=" w-[246px] h-[36px] flex justify-between items-center">
              <div className="w-[30px] h-[30px] flex justify-center items-center">
                <img
                  src="images/本2.png"
                  alt="本2"
                  className="w-[28px] h-[28px] object-contain"
                />
              </div>
              <div className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] w-[210px] h-[35.5px] flex justify-center items-center text-white text-[27px] font-bold">
                ペット日記一覧
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] w-[146px] h-[48px] flex justify-between items-center px-[20px] py-[14.5px] rounded-[12px]">
              <div className="w-[18px] h-[18px] text-[17px] text-white font-semibold leading-[18px]">
                ＋
              </div>
              <div className="w-[80px] h-[19px] text-[15px] text-white font-medium leading-[19px]">
                新しい日記
              </div>
            </div>
          </div>
          <div className="w-full h-auto mt-[32px] flex">
            <div className="grid grid-cols-4 gap-[37px]">
              <div className="w-[324.2px] h-[406px] bg-white/90 backdrop-blur rounded-[16px] shadow-lg">
                <div className="w-[324.2px] h-[224px] rounded-t-[16px]">
                  <img
                    src="images/wim.jpg"
                    alt="ウィム"
                    className="w-[324.2px] h-[224px] rounded-t-[16px] object-cover"
                  />
                </div>
                <div className="w-[324.2px] h-[182px] rounded-b-[16px] p-[24px]">
                  <div className="w-full h-[26px] flex items-center">
                    <div className="w-[26px] h-[26px] rounded-[50%] flex justify-center items-center">
                      <img
                        src="images/日付.png"
                        alt="日付"
                        className="w-[15px] h-[15px] object-cover mr-[2px]"
                      />
                    </div>
                    <div className="w-[100px] h-[17px] text-[#6B7280] leading-[18px] text-[13px] flex ml-[8px]">
                      2023年12月1日
                    </div>
                  </div>
                  <div className="w-full h-[56px] flex text-[#1F2937] items-center mt-[12px] overflow-hidden">
                    <p className="line-clamp-2">
                      毛繕いをしていたらなんと足が3本になっていて困っていたウィム。
                    </p>
                  </div>
                  <div className="w-full h-[20px] flex justify-end items-center mt-[20px]">
                    <div className="w-[70px] h-[16.5px] text-[#9333EA] text-[11.9px] font-medium">
                      詳細を見る
                    </div>
                    <div className="w-[16px] h-[16px] text-[#9333EA] text-[11.9px] font-medium">
                      <img
                        src="images/大なり.png"
                        alt="大なり"
                        className="w-[16px] h-[16px] object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[324.2px] h-[406px] bg-white/90 backdrop-blur rounded-[16px] shadow-lg">
                <div className="w-[324.2px] h-[224px] bg-[pink] rounded-t-[16px]">
                  <img
                    src="images/pino.jpg"
                    alt="ピノ"
                    className="w-[324.2px] h-[224px] rounded-t-[16px] object-cover"
                  />
                </div>
                <div className="w-[324.2px] h-[182px] rounded-b-[16px] p-[24px]">
                  <div className="w-full h-[26px] flex items-center">
                    <div className="w-[26px] h-[26px] rounded-[50%] flex justify-center items-center">
                      <img
                        src="images/日付.png"
                        alt="日付"
                        className="w-[15px] h-[15px] object-cover mr-[2px]"
                      />
                    </div>
                    <div className="w-[100px] h-[17px] text-[#6B7280] leading-[18px] text-[13px] flex ml-[8px]">
                      2023年12月2日
                    </div>
                  </div>
                  <div className="w-full h-[56px] flex text-[#1F2937] items-center mt-[12px] overflow-hidden">
                    <p className="line-clamp-2">
                      手術がショックだったピノ。友達のクマに紛れて隠れているつもりみたい。
                    </p>
                  </div>
                  <div className="w-full h-[20px] flex justify-end items-center mt-[20px]">
                    <div className="w-[70px] h-[16.5px] text-[#9333EA] text-[11.9px] font-medium">
                      詳細を見る
                    </div>
                    <div className="w-[16px] h-[16px] text-[#9333EA] text-[11.9px] font-medium">
                      <img
                        src="images/大なり.png"
                        alt="大なり"
                        className="w-[16px] h-[16px] object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[324.2px] h-[406px] bg-white/90 backdrop-blur rounded-[16px] shadow-lg">
                <div className="w-[324.2px] h-[224px] bg-[pink] rounded-t-[16px]">
                  <img
                    src="images/yuki.jpg"
                    alt="ユキ"
                    className="w-[324.2px] h-[224px] rounded-t-[16px] object-cover"
                  />
                </div>
                <div className="w-[324.2px] h-[182px] rounded-b-[16px] p-[24px]">
                  <div className="w-full h-[26px] flex items-center">
                    <div className="w-[26px] h-[26px] rounded-[50%] flex justify-center items-center">
                      <img
                        src="images/日付.png"
                        alt="日付"
                        className="w-[15px] h-[15px] object-cover mr-[2px]"
                      />
                    </div>
                    <div className="w-[100px] h-[17px] text-[#6B7280] leading-[18px] text-[13px] flex ml-[8px]">
                      2023年12月3日
                    </div>
                  </div>
                  <div className="w-full h-[56px] flex text-[#1F2937] items-center mt-[12px] overflow-hidden">
                    <p className="line-clamp-2">
                      部屋んぽ中に疲れてしまい、堂々と寝ているユキちゃん。
                    </p>
                  </div>
                  <div className="w-full h-[20px] flex justify-end items-center mt-[20px]">
                    <div className="w-[70px] h-[16.5px] text-[#9333EA] text-[11.9px] font-medium">
                      詳細を見る
                    </div>
                    <div className="w-[16px] h-[16px] text-[#9333EA] text-[11.9px] font-medium">
                      <img
                        src="images/大なり.png"
                        alt="大なり"
                        className="w-[16px] h-[16px] object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[324.2px] h-[406px] bg-white/90 backdrop-blur rounded-[16px] shadow-lg">
                <div className="w-[324.2px] h-[224px] bg-[pink] rounded-t-[16px]">
                  <img
                    src="images/ogum.jpg"
                    alt="オグマ"
                    className="w-[324.2px] h-[224px] rounded-t-[16px] object-cover"
                  />
                </div>
                <div className="w-[324.2px] h-[182px] rounded-b-[16px] p-[24px]">
                  <div className="w-full h-[26px] flex items-center">
                    <div className="w-[26px] h-[26px] rounded-[50%] flex justify-center items-center">
                      <img
                        src="images/日付.png"
                        alt="日付"
                        className="w-[15px] h-[15px] object-cover mr-[2px]"
                      />
                    </div>
                    <div className="w-[100px] h-[17px] text-[#6B7280] leading-[18px] text-[13px] flex ml-[8px]">
                      2023年12月4日
                    </div>
                  </div>
                  <div className="w-full h-[56px] flex text-[#1F2937] items-center mt-[12px] overflow-hidden">
                    <p className="line-clamp-2">
                      仕事の合間に仮眠をとっているオグマ。
                    </p>
                  </div>
                  <div className="w-full h-[20px] flex justify-end items-center mt-[20px]">
                    <div className="w-[70px] h-[16.5px] text-[#9333EA] text-[11.9px] font-medium">
                      詳細を見る
                    </div>
                    <div className="w-[16px] h-[16px] text-[#9333EA] text-[11.9px] font-medium">
                      <img
                        src="images/大なり.png"
                        alt="大なり"
                        className="w-[16px] h-[16px] object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
